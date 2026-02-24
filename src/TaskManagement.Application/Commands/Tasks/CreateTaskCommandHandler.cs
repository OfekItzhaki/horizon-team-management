using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using TaskManagement.Application.DTOs;
using TaskManagement.Application.Mappings;
using TaskManagement.Application.Messaging;
using TaskManagement.Domain.Entities;
using TaskManagement.Domain.Enums;
using TaskManagement.Domain.Interfaces;
using TaskManagement.Infrastructure.Data;

namespace TaskManagement.Application.Commands.Tasks;

public class CreateTaskCommandHandler : IRequestHandler<CreateTaskCommand, TaskDto>
{
    private readonly TaskManagementDbContext _context;
    private readonly ILogger<CreateTaskCommandHandler> _logger;
    private readonly IOutboxService _outboxService;

    public CreateTaskCommandHandler(
        TaskManagementDbContext context, 
        ILogger<CreateTaskCommandHandler> logger,
        IOutboxService outboxService)
    {
        _context = context;
        _logger = logger;
        _outboxService = outboxService;
    }

    public async System.Threading.Tasks.Task<TaskDto> Handle(CreateTaskCommand request, CancellationToken cancellationToken)
    {
        _logger.LogDebug("Creating task: {Title}", request.Task.Title);
        var task = new Domain.Entities.Task
        {
            Title = Common.InputSanitizer.Sanitize(request.Task.Title),
            Description = Common.InputSanitizer.Sanitize(request.Task.Description),
            DueDate = request.Task.DueDate,
            Priority = request.Task.Priority,
            CreatedByUserId = request.Task.CreatedByUserId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        if (request.Task.UserIds.Any())
        {
            var users = await _context.Users
                .Where(u => request.Task.UserIds.Contains(u.Id))
                .ToListAsync(cancellationToken);

            var now = DateTime.UtcNow;
            foreach (var user in users)
            {
                var role = user.Id == request.Task.CreatedByUserId 
                    ? UserTaskRole.Owner 
                    : UserTaskRole.Assignee;
                
                task.UserTasks.Add(new UserTask
                {
                    Task = task,
                    User = user,
                    Role = role,
                    AssignedAt = now
                });
            }
        }

        if (request.Task.TagIds.Any())
        {
            var tags = await _context.Tags
                .Where(t => request.Task.TagIds.Contains(t.Id))
                .ToListAsync(cancellationToken);

            foreach (var tag in tags)
            {
                task.TaskTags.Add(new TaskTag
                {
                    Task = task,
                    Tag = tag
                });
            }
        }

        _context.Tasks.Add(task);

        // Get creator's email for the outbox message
        var creator = await _context.Users.FindAsync(new object[] { task.CreatedByUserId }, cancellationToken);
        
        await _outboxService.EnqueueMessageAsync(new TaskCreatedEvent
        {
            TaskId = task.Id,
            Title = task.Title,
            DueDate = task.DueDate,
            CreatedByUserEmail = creator?.Email ?? string.Empty
        }, cancellationToken);

        await _context.SaveChangesAsync(cancellationToken);

        await _context.Entry(task)
            .Collection(t => t.UserTasks)
            .Query()
            .Include(ut => ut.User)
            .LoadAsync(cancellationToken);

        await _context.Entry(task)
            .Collection(t => t.TaskTags)
            .Query()
            .Include(tt => tt.Tag)
            .LoadAsync(cancellationToken);

        _logger.LogInformation("Created task {TaskId}: {Title}", task.Id, task.Title);
        return task.ToTaskDto();
    }
}
