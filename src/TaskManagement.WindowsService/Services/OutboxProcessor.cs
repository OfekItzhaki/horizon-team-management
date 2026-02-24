using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using TaskManagement.Infrastructure.Data;
using TaskManagement.Infrastructure.RabbitMQ;

namespace TaskManagement.WindowsService.Services
{
    public class OutboxProcessorOptions
    {
        public const string SectionName = "OutboxProcessor";
        public int IntervalSeconds { get; set; } = 10;
        public int BatchSize { get; set; } = 20;
        public string EventQueueName { get; set; } = "Events";
    }

    public class OutboxProcessor : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<OutboxProcessor> _logger;
        private readonly IRabbitMQService _rabbitMQService;
        private readonly OutboxProcessorOptions _options;

        public OutboxProcessor(
            IServiceProvider serviceProvider,
            ILogger<OutboxProcessor> logger,
            IRabbitMQService rabbitMQService,
            IOptions<OutboxProcessorOptions> options)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
            _rabbitMQService = rabbitMQService;
            _options = options.Value;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Outbox Processor started. Polling every {Interval} seconds, batch size: {BatchSize}.",
                _options.IntervalSeconds, _options.BatchSize);

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await ProcessOutboxMessagesAsync(stoppingToken);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error processing outbox messages: {Message}", ex.Message);
                }

                await Task.Delay(TimeSpan.FromSeconds(_options.IntervalSeconds), stoppingToken);
            }
        }

        private async Task ProcessOutboxMessagesAsync(CancellationToken stoppingToken)
        {
            using var scope = _serviceProvider.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<TaskManagementDbContext>();

            var messages = await dbContext.OutboxMessages
                .Where(m => m.ProcessedOnUtc == null)
                .OrderBy(m => m.OccurredOnUtc)
                .Take(_options.BatchSize)
                .ToListAsync(stoppingToken);

            if (!messages.Any()) return;

            _logger.LogInformation("Processing {Count} outbox messages...", messages.Count);

            foreach (var message in messages)
            {
                try
                {
                    _rabbitMQService.PublishMessage(
                        _options.EventQueueName, 
                        message.Content, 
                        new Dictionary<string, string> 
                        { 
                            ["X-Message-Type"] = message.Type,
                            ["X-Message-ID"] = message.Id.ToString()
                        });

                    message.ProcessedOnUtc = DateTime.UtcNow;
                    _logger.LogDebug("Message {MessageId} ({MessageType}) processed successfully.", message.Id, message.Type);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to publish outbox message {MessageId}: {Message}", message.Id, ex.Message);
                    message.Error = ex.Message;
                }
            }

            await dbContext.SaveChangesAsync(stoppingToken);
        }
    }
}
