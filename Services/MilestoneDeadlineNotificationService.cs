using BlokuGrandiniuSistema.Models;
using Microsoft.EntityFrameworkCore;

namespace BlokuGrandiniuSistema.Services;

public sealed class MilestoneDeadlineNotificationService : BackgroundService
{
    private static readonly TimeSpan CheckInterval = TimeSpan.FromMinutes(15);
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<MilestoneDeadlineNotificationService> _logger;

    public MilestoneDeadlineNotificationService(
        IServiceScopeFactory scopeFactory,
        ILogger<MilestoneDeadlineNotificationService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        await RunCheck(stoppingToken);

        using var timer = new PeriodicTimer(CheckInterval);
        while (await timer.WaitForNextTickAsync(stoppingToken))
        {
            await RunCheck(stoppingToken);
        }
    }

    private async Task RunCheck(CancellationToken ct)
    {
        try
        {
            await using var scope = _scopeFactory.CreateAsyncScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            var today = DateOnly.FromDateTime(DateTime.Today);

            var dueMilestones = await db.b_contract_milestones
                .Include(m => m.fkContract)
                .Include(m => m.fkRequirement)
                .Where(m =>
                    m.fkRequirement != null &&
                    m.fkRequirement.forseenCompletionDate.HasValue &&
                    m.fkRequirement.forseenCompletionDate.Value <= today &&
                    m.fkContract.fundedAmountEth.HasValue &&
                    m.fkContract.chainProjectId.HasValue &&
                    m.fkContract.status != "Completed" &&
                    m.fkContract.status != "Closed" &&
                    m.fkContract.status != "Cancelled" &&
                    m.status != "Submitted" &&
                    m.status != "Released" &&
                    m.status != "ReleasedPartial" &&
                    m.status != "Cancelled")
                .ToListAsync(ct);

            foreach (var milestone in dueMilestones)
            {
                var contract = milestone.fkContract;
                var deadline = milestone.fkRequirement!.forseenCompletionDate!.Value;
                var message = $"Milestone #{milestone.milestoneNo} deadline for contract #{contract.contractId} is {deadline:yyyy-MM-dd}. Please submit the milestone if it is ready.";

                var alreadyNotified = await db.b_notifications.AnyAsync(n =>
                    n.fkUserId == contract.fkProviderUserId &&
                    n.type == "milestone_deadline_reached" &&
                    n.referenceId == contract.contractId &&
                    n.message == message, ct);

                if (alreadyNotified) continue;

                db.b_notifications.Add(new b_notification
                {
                    fkUserId = contract.fkProviderUserId,
                    title = "Milestone deadline reached",
                    message = message,
                    type = "milestone_deadline_reached",
                    referenceId = contract.contractId,
                    isRead = false,
                    createdAt = DateTime.UtcNow
                });
            }

            if (db.ChangeTracker.HasChanges())
            {
                await db.SaveChangesAsync(ct);
            }
        }
        catch (OperationCanceledException) when (ct.IsCancellationRequested)
        {
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create milestone deadline notifications.");
        }
    }
}
