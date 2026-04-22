using System.Security.Claims;
using BlokuGrandiniuSistema.DTOs;
using BlokuGrandiniuSistema.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BlokuGrandiniuSistema.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MessagesController : ControllerBase
{
    private readonly AppDbContext _db;

    public MessagesController(AppDbContext db)
    {
        _db = db;
    }

    [Authorize]
    [HttpGet("contract/{contractId:int}")]
    public async Task<ActionResult<ContractMessagesResponseDTO>> GetContractMessages(int contractId, CancellationToken ct)
    {
        var userId = GetUserIdFromJwt();
        if (userId == null) return Unauthorized();

        var contract = await _db.b_contracts
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.contractId == contractId, ct);

        if (contract == null)
            return NotFound("Contract not found.");

        if (contract.fkClientUserId != userId.Value && contract.fkProviderUserId != userId.Value)
            return Forbid();

        var otherUserId = contract.fkClientUserId == userId.Value
            ? contract.fkProviderUserId
            : contract.fkClientUserId;

        var otherUser = await _db.b_users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.UserId == otherUserId, ct);

        var unreadMessages = await _db.b_contract_messages
            .Where(m =>
                m.fkContractId == contractId &&
                m.fkReceiverUserId == userId.Value &&
                !m.isRead)
            .ToListAsync(ct);

        if (unreadMessages.Count > 0)
        {
            foreach (var msg in unreadMessages)
            {
                msg.isRead = true;
                msg.readAt = DateTime.UtcNow;
            }

            await _db.SaveChangesAsync(ct);
        }

        var messages = await _db.b_contract_messages
            .AsNoTracking()
            .Where(m => m.fkContractId == contractId)
            .OrderBy(m => m.sentAt)
            .ToListAsync(ct);

        var userIds = messages
            .SelectMany(m => new[] { m.fkSenderUserId, m.fkReceiverUserId })
            .Distinct()
            .ToList();

        var users = await _db.b_users
            .AsNoTracking()
            .Where(u => userIds.Contains(u.UserId))
            .ToDictionaryAsync(u => u.UserId, ct);

        var dto = new ContractMessagesResponseDTO
        {
            ContractId = contract.contractId,
            ContractStatus = contract.status ?? "",
            CurrentUserId = userId.Value,
            OtherUserId = otherUserId,
            OtherUserName = BuildUserName(otherUser),
            CanSendMessages = CanSendMessages(contract.status),
            Messages = messages.Select(m => new ContractMessageDTO
            {
                MessageId = m.messageId,
                ContractId = m.fkContractId,
                SenderUserId = m.fkSenderUserId,
                ReceiverUserId = m.fkReceiverUserId,
                MessageText = m.messageText,
                SentAt = m.sentAt,
                IsRead = m.isRead,
                ReadAt = m.readAt,
                SenderName = users.TryGetValue(m.fkSenderUserId, out var sender) ? BuildUserName(sender) : $"User #{m.fkSenderUserId}",
                ReceiverName = users.TryGetValue(m.fkReceiverUserId, out var receiver) ? BuildUserName(receiver) : $"User #{m.fkReceiverUserId}"
            }).ToList()
        };

        return Ok(dto);
    }

    [Authorize]
    [HttpPost("contract/{contractId:int}")]
    public async Task<ActionResult<ContractMessageDTO>> SendMessage(
    int contractId,
    [FromBody] SendContractMessageDTO dto,
    CancellationToken ct)
    {
        var userId = GetUserIdFromJwt();
        if (userId == null) return Unauthorized();

        if (string.IsNullOrWhiteSpace(dto.MessageText))
            return BadRequest("Message text is required.");

        var contract = await _db.b_contracts
            .FirstOrDefaultAsync(c => c.contractId == contractId, ct);

        if (contract == null)
            return NotFound("Contract not found.");

        if (contract.fkClientUserId != userId.Value && contract.fkProviderUserId != userId.Value)
            return Forbid();

        if (!CanSendMessages(contract.status))
            return BadRequest("Messages are disabled because the contract is already finished.");

        var receiverUserId = contract.fkClientUserId == userId.Value
            ? contract.fkProviderUserId
            : contract.fkClientUserId;

        var messageText = dto.MessageText.Trim();

        var message = new b_contract_message
        {
            fkContractId = contractId,
            fkSenderUserId = userId.Value,
            fkReceiverUserId = receiverUserId,
            messageText = messageText,
            sentAt = DateTime.UtcNow,
            isRead = false,
            readAt = null
        };

        // 🔹 pasiimam sender vardą notificationui
        var sender = await _db.b_users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.UserId == userId.Value, ct);

        var senderName = !string.IsNullOrWhiteSpace(sender?.Username)
            ? sender.Username
            : $"{sender?.firstname ?? ""} {sender?.lastname ?? ""}".Trim();

        if (string.IsNullOrWhiteSpace(senderName))
            senderName = $"User #{userId.Value}";

        // 🔹 trumpinam tekstą notificationui
        var preview = messageText.Length > 120
            ? messageText.Substring(0, 120) + "..."
            : messageText;

        var notification = new b_notification
        {
            fkUserId = receiverUserId,
            title = "New message",
            message = $"{senderName} sent you a message: {preview}",
            type = "contract_message",
            referenceId = contractId,
            isRead = false,
            createdAt = DateTime.UtcNow
        };

        _db.b_contract_messages.Add(message);
        _db.b_notifications.Add(notification);

        await _db.SaveChangesAsync(ct);

        return Ok(new ContractMessageDTO
        {
            MessageId = message.messageId,
            ContractId = message.fkContractId,
            SenderUserId = message.fkSenderUserId,
            ReceiverUserId = message.fkReceiverUserId,
            MessageText = message.messageText,
            SentAt = message.sentAt,
            IsRead = message.isRead,
            ReadAt = message.readAt,
            SenderName = senderName,
            ReceiverName = "" // gali pasidaryti jei reikia
        });
    }

    [Authorize]
    [HttpPost("contract/{contractId:int}/mark-as-read")]
    public async Task<ActionResult> MarkAsRead(int contractId, CancellationToken ct)
    {
        var userId = GetUserIdFromJwt();
        if (userId == null) return Unauthorized();

        var contract = await _db.b_contracts
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.contractId == contractId, ct);

        if (contract == null)
            return NotFound("Contract not found.");

        if (contract.fkClientUserId != userId.Value && contract.fkProviderUserId != userId.Value)
            return Forbid();

        var unreadMessages = await _db.b_contract_messages
            .Where(m =>
                m.fkContractId == contractId &&
                m.fkReceiverUserId == userId.Value &&
                !m.isRead)
            .ToListAsync(ct);

        foreach (var msg in unreadMessages)
        {
            msg.isRead = true;
            msg.readAt = DateTime.UtcNow;
        }

        await _db.SaveChangesAsync(ct);
        return Ok(new { updated = unreadMessages.Count });
    }

    private static bool CanSendMessages(string? contractStatus)
    {
        return !string.Equals(contractStatus, "Completed", StringComparison.OrdinalIgnoreCase) &&
               !string.Equals(contractStatus, "Closed", StringComparison.OrdinalIgnoreCase) &&
               !string.Equals(contractStatus, "Cancelled", StringComparison.OrdinalIgnoreCase);
    }

    private static string BuildUserName(b_user? user)
    {
        if (user == null) return "";

        if (!string.IsNullOrWhiteSpace(user.Username))
            return user.Username;

        var fullName = $"{user.firstname ?? ""} {user.lastname ?? ""}".Trim();

        if (!string.IsNullOrWhiteSpace(fullName))
            return fullName;

        return $"User #{user.UserId}";
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
