using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BlokuGrandiniuSistema.Models;

namespace BlokuGrandiniuSistema.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NotificationsController : ControllerBase
{
    private readonly AppDbContext _db;

    public NotificationsController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetMine(CancellationToken ct)
    {
        var userId = GetUserIdFromJwt();
        if (userId == null) return Unauthorized();

        var items = await _db.b_notifications
            .AsNoTracking()
            .Where(n => n.fkUserId == userId.Value)
            .OrderByDescending(n => n.createdAt)
            .Select(n => new
            {
                notificationId = n.notificationId,
                title = n.title,
                message = n.message,
                type = n.type,
                referenceId = n.referenceId,
                isRead = n.isRead,
                createdAt = n.createdAt
            })
            .ToListAsync(ct);

        return Ok(items);
    }

    [HttpGet("unread-count")]
    public async Task<IActionResult> GetUnreadCount(CancellationToken ct)
    {
        var userId = GetUserIdFromJwt();
        if (userId == null) return Unauthorized();

        var count = await _db.b_notifications
            .CountAsync(n => n.fkUserId == userId.Value && !n.isRead, ct);

        return Ok(new { count });
    }

    [HttpPost("{notificationId:int}/read")]
    public async Task<IActionResult> MarkAsRead(int notificationId, CancellationToken ct)
    {
        var userId = GetUserIdFromJwt();
        if (userId == null) return Unauthorized();

        var item = await _db.b_notifications
            .FirstOrDefaultAsync(n => n.notificationId == notificationId && n.fkUserId == userId.Value, ct);

        if (item == null) return NotFound();

        item.isRead = true;
        await _db.SaveChangesAsync(ct);

        return Ok(new { message = "Notification marked as read." });
    }

    [HttpPost("read-all")]
    public async Task<IActionResult> MarkAllAsRead(CancellationToken ct)
    {
        var userId = GetUserIdFromJwt();
        if (userId == null) return Unauthorized();

        var items = await _db.b_notifications
            .Where(n => n.fkUserId == userId.Value && !n.isRead)
            .ToListAsync(ct);

        foreach (var item in items)
            item.isRead = true;

        await _db.SaveChangesAsync(ct);

        return Ok(new { message = "All notifications marked as read." });
    }

    private int? GetUserIdFromJwt()
    {
        var s =
            User.FindFirstValue("userId") ??
            User.FindFirstValue(ClaimTypes.NameIdentifier) ??
            User.FindFirstValue("sub");

        return int.TryParse(s, out var id) ? id : null;
    }
}