namespace TaskManagement.Application.Exceptions;

/// <summary>
/// Thrown when a user attempts to perform an action they don't have permission for.
/// Maps to HTTP 403 in API.
/// </summary>
public class ForbiddenException : Exception
{
    public ForbiddenException(string message) : base(message) { }

    public ForbiddenException(string message, Exception inner) : base(message, inner) { }
}
