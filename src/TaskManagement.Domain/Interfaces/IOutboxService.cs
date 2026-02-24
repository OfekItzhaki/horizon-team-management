using System.Threading;
using System.Threading.Tasks;

namespace TaskManagement.Domain.Interfaces
{
    public interface IOutboxService
    {
        Task EnqueueMessageAsync<T>(T message, CancellationToken cancellationToken = default);
    }
}
