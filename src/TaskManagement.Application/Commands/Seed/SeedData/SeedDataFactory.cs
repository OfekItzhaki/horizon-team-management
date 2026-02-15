using TaskManagement.Domain.Interfaces;
using TaskManagement.Domain.Entities;

namespace TaskManagement.Application.Commands.Seed.SeedData;

/// <summary>
/// Creates users and tags seed data for database initialization
/// </summary>
public static class SeedDataFactory
{
    public static List<User> CreateUsers(IPasswordHasher hasher)
    {
        return new List<User>
        {
            new User
            {
                FullName = "John Doe",
                Username = "jdoe",
                PasswordHash = hasher.HashPassword("Password123!"),
                Email = "john.doe@example.com",
                Telephone = "555-0101",
                Role = Domain.Enums.UserRole.Admin,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new User
            {
                FullName = "Jane Smith",
                Username = "jsmith",
                PasswordHash = hasher.HashPassword("Password123!"),
                Email = "jane.smith@example.com",
                Telephone = "555-0102",
                Role = Domain.Enums.UserRole.StandardUser,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new User
            {
                FullName = "Bob Johnson",
                Username = "bjohnson",
                PasswordHash = hasher.HashPassword("Password123!"),
                Email = "bob.johnson@example.com",
                Telephone = "555-0103",
                Role = Domain.Enums.UserRole.StandardUser,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new User
            {
                FullName = "Alice Williams",
                Username = "awilliams",
                PasswordHash = hasher.HashPassword("Password123!"),
                Email = "alice.williams@example.com",
                Telephone = "555-0104",
                Role = Domain.Enums.UserRole.StandardUser,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new User
            {
                FullName = "Charlie Brown",
                Username = "cbrown",
                PasswordHash = hasher.HashPassword("Password123!"),
                Email = "charlie.brown@example.com",
                Telephone = "555-0105",
                Role = Domain.Enums.UserRole.StandardUser,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            }
        };
    }

    public static List<Tag> CreateTags()
    {
        return new List<Tag>
        {
            new Tag { Name = "Urgent", Color = "#FF0000", CreatedAt = DateTime.UtcNow },
            new Tag { Name = "Important", Color = "#FFA500", CreatedAt = DateTime.UtcNow },
            new Tag { Name = "Development", Color = "#0000FF", CreatedAt = DateTime.UtcNow },
            new Tag { Name = "Testing", Color = "#00FF00", CreatedAt = DateTime.UtcNow },
            new Tag { Name = "Documentation", Color = "#800080", CreatedAt = DateTime.UtcNow },
            new Tag { Name = "Meeting", Color = "#FFC0CB", CreatedAt = DateTime.UtcNow },
            new Tag { Name = "Review", Color = "#FFFF00", CreatedAt = DateTime.UtcNow },
            new Tag { Name = "Bug Fix", Color = "#FF4500", CreatedAt = DateTime.UtcNow }
        };
    }
}
