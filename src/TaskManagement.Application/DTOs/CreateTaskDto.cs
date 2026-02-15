using System.ComponentModel.DataAnnotations;
using TaskManagement.Domain.Enums;

namespace TaskManagement.Application.DTOs;

/// <summary>
/// Data transfer object for creating a new task.
/// </summary>
public record CreateTaskDto
{
    /// <summary>
    /// The title of the task (max 200 characters).
    /// </summary>
    /// <example>Complete project documentation</example>
    [Required]
    [MaxLength(200)]
    public string Title { get; init; } = string.Empty;

    /// <summary>
    /// The description of the task (max 1000 characters).
    /// </summary>
    /// <example>Write comprehensive README and API documentation</example>
    [Required]
    [MaxLength(1000)]
    public string Description { get; init; } = string.Empty;

    /// <summary>
    /// The due date for the task (must be today or in the future).
    /// </summary>
    /// <example>2024-12-31T00:00:00Z</example>
    [Required]
    public DateTime DueDate { get; init; }

    /// <summary>
    /// The priority of the task. Values: 1=Low, 2=Medium, 3=High, 4=Critical
    /// </summary>
    /// <example>3</example>
    [Required]
    [Range(1, 4, ErrorMessage = "Priority must be between 1 and 4")]
    public Priority Priority { get; init; }

    /// <summary>
    /// The ID of the user who created the task.
    /// </summary>
    /// <example>1</example>
    [Required]
    public int CreatedByUserId { get; init; }

    /// <summary>
    /// List of user IDs assigned to this task (at least one required).
    /// </summary>
    /// <example>[1, 2]</example>
    [Required]
    [MinLength(1, ErrorMessage = "At least one user must be assigned")]
    public IReadOnlyList<int> UserIds { get; init; } = new List<int>();

    /// <summary>
    /// List of tag IDs associated with this task (at least one required).
    /// </summary>
    /// <example>[1, 2, 3]</example>
    [Required]
    [MinLength(1, ErrorMessage = "At least one tag must be selected")]
    public IReadOnlyList<int> TagIds { get; init; } = new List<int>();
}
