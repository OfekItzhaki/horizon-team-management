using TaskManagement.Domain.Enums;

namespace TaskManagement.Application.DTOs;

public record TaskDto
{
    public int Id { get; init; }
    public string Title { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public DateTime DueDate { get; init; }
    public Priority Priority { get; init; }
    public int CreatedByUserId { get; init; }
    public byte[] RowVersion { get; init; } = Array.Empty<byte>();
    public IReadOnlyList<UserTaskDto> Users { get; init; } = new List<UserTaskDto>();
    public IReadOnlyList<TagDto> Tags { get; init; } = new List<TagDto>();
}
