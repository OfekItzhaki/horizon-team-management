using TaskManagement.Domain.Enums;

namespace TaskManagement.Application.DTOs;

public record UserDto
{
    public int Id { get; init; }
    public string FullName { get; init; } = string.Empty;
    public string Username { get; init; } = string.Empty;
    public string Telephone { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
    public UserRole Role { get; init; }
}
