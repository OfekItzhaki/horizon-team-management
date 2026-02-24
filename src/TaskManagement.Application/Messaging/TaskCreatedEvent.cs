using System;

namespace TaskManagement.Application.Messaging
{
    public class TaskCreatedEvent
    {
        public int TaskId { get; set; }
        public string Title { get; set; } = string.Empty;
        public DateTime DueDate { get; set; }
        public string CreatedByUserEmail { get; set; } = string.Empty;
    }
}
