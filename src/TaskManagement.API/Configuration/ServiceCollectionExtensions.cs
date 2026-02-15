using System.Threading.RateLimiting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

namespace TaskManagement.API.Configuration;

/// <summary>
/// Centralizes service registration for the API
/// </summary>
public static class ServiceCollectionExtensions
{
    public static void AddTaskManagementApi(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddControllers(options =>
        {
            options.ModelBinderProviders.Insert(0, new Microsoft.AspNetCore.Mvc.ModelBinding.Binders.ArrayModelBinderProvider());
        });
        services.AddEndpointsApiExplorer();
        services.AddSwaggerDocumentation();

        // API versioning
        services.AddApiVersioning(options =>
        {
            options.DefaultApiVersion = new ApiVersion(1, 0);
            options.AssumeDefaultVersionWhenUnspecified = true;
            options.ReportApiVersions = true;
        });
        services.AddVersionedApiExplorer(options =>
        {
            options.GroupNameFormat = "'v'VVV";
            options.SubstituteApiVersionInUrl = false; // Version via query ?api-version=1.0 or header to avoid breaking existing clients
        });

        // Rate limiting (built-in .NET 8)
        services.AddRateLimiter(options =>
        {
            options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(context =>
                RateLimitPartition.GetFixedWindowLimiter(
                    partitionKey: context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
                    factory: _ => new FixedWindowRateLimiterOptions
                    {
                        PermitLimit = 100,
                        Window = TimeSpan.FromMinutes(1),
                        QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                        QueueLimit = 2
                    }));
        });

        // JWT Authentication
        var tokenKey = configuration["Jwt:TokenKey"] ?? throw new InvalidOperationException("Jwt:TokenKey not found");
        services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(tokenKey)),
                    ValidateIssuer = false,
                    ValidateAudience = false
                };
            });

        var connectionString = configuration.GetConnectionString("DefaultConnection");
        services.AddHealthChecks()
            .AddSqlServer(connectionString ?? string.Empty, name: "sqlserver", failureStatus: HealthStatus.Unhealthy)
            .AddRabbitMQ(rabbitConnectionString: "amqp://localhost", name: "rabbitmq", failureStatus: HealthStatus.Degraded);

        services.AddHealthChecksUI(setup =>
        {
            setup.AddHealthCheckEndpoint("System Health", "/health");
            setup.SetEvaluationTimeInSeconds(30);
        })
        .AddInMemoryStorage();
    }
}
