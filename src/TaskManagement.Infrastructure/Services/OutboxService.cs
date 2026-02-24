using System;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using TaskManagement.Domain.Entities;
using TaskManagement.Domain.Interfaces;
using TaskManagement.Infrastructure.Data;

namespace TaskManagement.Infrastructure.Services
{
    public class OutboxService : IOutboxService
    {
        private readonly TaskManagementDbContext _dbContext;

        public OutboxService(TaskManagementDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task EnqueueMessageAsync<T>(T message, CancellationToken cancellationToken = default)
        {
            var outboxMessage = new OutboxMessage
            {
                Id = Guid.NewGuid(),
                Type = typeof(T).Name,
                Content = JsonSerializer.Serialize(message),
                OccurredOnUtc = DateTime.UtcNow
            };

            _dbContext.OutboxMessages.Add(outboxMessage);
            await Task.CompletedTask; // Saving is handled by the caller's SaveChangesAsync or we can add it here if preferred.
            // Following the Outbox pattern, this should be part of the same transaction as the business operation.
            // CreateTaskCommandHandler calls SaveChangesAsync at the end, so just adding it to the context is enough.
        }
    }
}
