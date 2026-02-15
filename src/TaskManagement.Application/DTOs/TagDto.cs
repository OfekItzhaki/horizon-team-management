namespace TaskManagement.Application.DTOs;

public record TagDto
{
    public int Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string? Color { get; init; }
}
