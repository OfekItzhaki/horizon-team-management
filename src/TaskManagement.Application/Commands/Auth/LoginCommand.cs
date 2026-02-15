using MediatR;
using TaskManagement.Application.DTOs;

namespace TaskManagement.Application.Commands.Auth;

public record LoginCommand : IRequest<AuthResponseDto>
{
    public string Username { get; init; } = string.Empty;
    public string Password { get; init; } = string.Empty;
}

public record AuthResponseDto
{
    public UserDto User { get; init; } = null!;
    public string Token { get; init; } = string.Empty;
}
