using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using TaskManagement.Application.Exceptions;
using TaskManagement.Application.Mappings;
using TaskManagement.Domain.Interfaces;
using TaskManagement.Infrastructure.Data;

namespace TaskManagement.Application.Commands.Auth;

public class LoginCommandHandler : IRequestHandler<LoginCommand, AuthResponseDto>
{
    private readonly TaskManagementDbContext _context;
    private readonly IPasswordHasher _passwordHasher;
    private readonly ITokenService _tokenService;
    private readonly ILogger<LoginCommandHandler> _logger;

    public LoginCommandHandler(
        TaskManagementDbContext context,
        IPasswordHasher passwordHasher,
        ITokenService tokenService,
        ILogger<LoginCommandHandler> logger)
    {
        _context = context;
        _passwordHasher = passwordHasher;
        _tokenService = tokenService;
        _logger = logger;
    }

    public async Task<AuthResponseDto> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Login attempt for user: {Username}", request.Username);

        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Username == request.Username, cancellationToken);

        if (user == null || !_passwordHasher.VerifyPassword(request.Password, user.PasswordHash))
        {
            _logger.LogWarning("Invalid login attempt for user: {Username}", request.Username);
            throw new ValidationException("Invalid username or password");
        }

        _logger.LogInformation("User logged in successfully: {Username}", request.Username);

        return new AuthResponseDto
        {
            User = user.ToUserDto(),
            Token = _tokenService.CreateToken(user)
        };
    }
}
