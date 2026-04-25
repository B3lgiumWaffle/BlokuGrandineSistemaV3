using System.Security.Claims;
using BlokuGrandiniuSistema.DTOs;
using BlokuGrandiniuSistema.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BlokuGrandiniuSistema.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CommentController : ControllerBase
{
    private readonly AppDbContext _db;

    public CommentController(AppDbContext db)
    {
        _db = db;
    }

    [Authorize]
    [HttpGet("my-completed-contracts")]
    public async Task<ActionResult<IEnumerable<CompletedContractCommentListItemDTO>>> GetMyCompletedContracts(CancellationToken ct)
    {
        var userId = GetUserIdFromJwt();
        if (userId == null) return Unauthorized();

        var contracts = await (
            from c in _db.b_contracts.AsNoTracking()
            join i in _db.b_inquiries.AsNoTracking() on c.fkInquiryId equals i.inquiryId
            join l in _db.b_listings.AsNoTracking() on i.fk_listingId equals l.listingId
            join client in _db.b_users.AsNoTracking() on c.fkClientUserId equals client.UserId
            join provider in _db.b_users.AsNoTracking() on c.fkProviderUserId equals provider.UserId
            where c.fkClientUserId == userId.Value
                  && (c.status == "Closed" || c.status == "Completed" || c.status == "Cancelled" || c.status == "Canceled")
            orderby c.updatedAt descending, c.createdAt descending
            select new
            {
                Contract = c,
                ListingId = l.listingId,
                ListingTitle = l.Title,
                ClientName = !string.IsNullOrWhiteSpace(client.Username)
                    ? client.Username
                    : ((client.firstname ?? "") + " " + (client.lastname ?? "")).Trim(),
                ProviderName = !string.IsNullOrWhiteSpace(provider.Username)
                    ? provider.Username
                    : ((provider.firstname ?? "") + " " + (provider.lastname ?? "")).Trim()
            }
        ).ToListAsync(ct);

        var contractIds = contracts.Select(x => x.Contract.contractId).ToList();

        var myComments = await _db.b_comments
            .AsNoTracking()
            .Where(x =>
                contractIds.Contains(x.fkContractId) &&
                x.fkUserId == userId.Value &&
                x.isVisible == true)
            .GroupBy(x => x.fkContractId)
            .Select(g => g.OrderByDescending(x => x.createdAt).First())
            .ToListAsync(ct);

        var commentsByContract = myComments.ToDictionary(x => x.fkContractId, x => x);

        var result = contracts.Select(x =>
        {
            commentsByContract.TryGetValue(x.Contract.contractId, out var comment);

            return new CompletedContractCommentListItemDTO
            {
                ContractId = x.Contract.contractId,
                ListingId = x.ListingId,
                ListingTitle = x.ListingTitle ?? "Untitled listing",
                OtherPartyName = x.ProviderName,
                MyRole = "Client",
                Status = x.Contract.status,
                HasComment = comment != null,
                CommentText = comment?.commentText,
                CommentCreatedAt = comment?.createdAt,
                ContractCreatedAt = x.Contract.createdAt
            };
        }).ToList();

        return Ok(result);
    }

    [Authorize]
    [HttpGet("contract/{contractId:int}")]
    public async Task<ActionResult<ContractCommentDetailsDTO>> GetContractCommentForm(int contractId, CancellationToken ct)
    {
        var userId = GetUserIdFromJwt();
        if (userId == null) return Unauthorized();

        var contractData = await (
            from c in _db.b_contracts.AsNoTracking()
            join i in _db.b_inquiries.AsNoTracking() on c.fkInquiryId equals i.inquiryId
            join l in _db.b_listings.AsNoTracking() on i.fk_listingId equals l.listingId
            join client in _db.b_users.AsNoTracking() on c.fkClientUserId equals client.UserId
            join provider in _db.b_users.AsNoTracking() on c.fkProviderUserId equals provider.UserId
            where c.contractId == contractId
            select new
            {
                Contract = c,
                ListingId = l.listingId,
                ListingTitle = l.Title,
                ClientName = !string.IsNullOrWhiteSpace(client.Username)
                    ? client.Username
                    : ((client.firstname ?? "") + " " + (client.lastname ?? "")).Trim(),
                ProviderName = !string.IsNullOrWhiteSpace(provider.Username)
                    ? provider.Username
                    : ((provider.firstname ?? "") + " " + (provider.lastname ?? "")).Trim()
            }
        ).FirstOrDefaultAsync(ct);

        if (contractData == null)
            return NotFound("Contract not found.");

        var contract = contractData.Contract;

        if (contract.fkClientUserId != userId.Value)
            return Forbid();

        if (!IsCommentableStatus(contract.status))
            return BadRequest("Only Completed, Closed, or Cancelled contracts can be commented.");

        var myComment = await _db.b_comments
            .AsNoTracking()
            .Where(x =>
                x.fkContractId == contractId &&
                x.fkUserId == userId.Value &&
                x.isVisible == true)
            .OrderByDescending(x => x.createdAt)
            .FirstOrDefaultAsync(ct);

        return Ok(new ContractCommentDetailsDTO
        {
            ContractId = contract.contractId,
            ListingId = contractData.ListingId,
            ListingTitle = contractData.ListingTitle ?? "Untitled listing",
            OtherPartyName = contractData.ProviderName,
            MyRole = "Client",
            Status = contract.status,
            HasComment = myComment != null,
            CommentText = myComment?.commentText,
            CommentCreatedAt = myComment?.createdAt
        });
    }

    [Authorize]
    [HttpGet("listing/{listingId:int}")]
    public async Task<ActionResult<IEnumerable<object>>> GetListingComments(int listingId, CancellationToken ct)
    {
        var comments = await (
            from c in _db.b_comments.AsNoTracking()
            join u in _db.b_users.AsNoTracking() on c.fkUserId equals u.UserId
            where c.fkListingId == listingId && c.isVisible == true
            orderby c.createdAt descending
            select new
            {
                CommentId = c.commentId,
                CommentText = c.commentText,
                CreatedAt = c.createdAt,
                Username = !string.IsNullOrWhiteSpace(u.Username)
                    ? u.Username
                    : ((u.firstname ?? "") + " " + (u.lastname ?? "")).Trim(),
                Avatar = u.avatar
            }
        ).ToListAsync(ct);

        return Ok(comments);
    }

    [Authorize]
    [HttpPost("contract/{contractId:int}")]
    public async Task<ActionResult> CreateComment(
        int contractId,
        [FromBody] CreateCommentDTO dto,
        CancellationToken ct)
    {
        var userId = GetUserIdFromJwt();
        if (userId == null) return Unauthorized();

        if (string.IsNullOrWhiteSpace(dto.CommentText))
            return BadRequest("Comment text is required.");

        var contractData = await (
            from c in _db.b_contracts
            join i in _db.b_inquiries on c.fkInquiryId equals i.inquiryId
            join l in _db.b_listings on i.fk_listingId equals l.listingId
            where c.contractId == contractId
            select new
            {
                Contract = c,
                ListingId = l.listingId
            }
        ).FirstOrDefaultAsync(ct);

        if (contractData == null)
            return NotFound("Contract not found.");

        var contract = contractData.Contract;

        if (contract.fkClientUserId != userId.Value)
            return Forbid();

        if (!IsCommentableStatus(contract.status))
            return BadRequest("Only Completed, Closed, or Cancelled contracts can be commented.");

        var existingComment = await _db.b_comments.FirstOrDefaultAsync(
            x => x.fkContractId == contractId &&
                 x.fkUserId == userId.Value &&
                 x.isVisible == true,
            ct);

        if (existingComment != null)
            return BadRequest("You already wrote a comment for this contract.");

        var entity = new b_comment
        {
            fkListingId = contractData.ListingId,
            fkContractId = contractId,
            fkUserId = userId.Value,
            commentText = dto.CommentText.Trim(),
            createdAt = DateTime.UtcNow,
            isVisible = true
        };

        _db.b_comments.Add(entity);
        await _db.SaveChangesAsync(ct);

        return Ok(new
        {
            message = "Comment saved successfully.",
            contractId,
            listingId = contractData.ListingId
        });
    }

    [Authorize]
    [HttpDelete("contract/{contractId:int}")]
    public async Task<ActionResult> DeleteComment(int contractId, CancellationToken ct)
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

        var comment = await _db.b_comments
            .Where(x =>
                x.fkContractId == contractId &&
                x.fkUserId == userId.Value &&
                x.isVisible == true)
            .OrderByDescending(x => x.createdAt)
            .FirstOrDefaultAsync(ct);

        if (comment == null)
            return NotFound("Comment not found.");

        comment.isVisible = false;

        await _db.SaveChangesAsync(ct);

        return Ok(new
        {
            message = "Comment deleted successfully.",
            contractId
        });
    }

    private bool IsCommentableStatus(string? status)
    {
        return string.Equals(status, "Closed", StringComparison.OrdinalIgnoreCase)
            || string.Equals(status, "Completed", StringComparison.OrdinalIgnoreCase)
            || string.Equals(status, "Cancelled", StringComparison.OrdinalIgnoreCase)
            || string.Equals(status, "Canceled", StringComparison.OrdinalIgnoreCase);
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
