using TaskManagement.Domain.Entities;

namespace TaskManagement.Domain.Interfaces;

public interface ITokenService
{
    string CreateToken(User user);
}
