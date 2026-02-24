using System.Threading;
using System.Threading.Tasks;

namespace TaskManagement.Domain.Interfaces
{
    public interface IOutboxService
    {
        System.Threading.Tasks.Task EnqueueMessageAsync<T>(T message, CancellationToken cancellationToken = default);
    }
}
