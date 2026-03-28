using System.Security.Claims;
using BlokuGrandiniuSistema.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BlokuGrandiniuSistema.Models;

namespace BlokuGrandiniuSistema.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ValuationController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IValuationService _valuationService;

    public ValuationController(AppDbContext db, IValuationService valuationService)
    {
        _db = db;
        _valuationService = valuationService;
    }

    [Authorize]
    [HttpGet("contract/{contractId:int}")]
    public async Task<IActionResult> GetContractRating(int contractId, CancellationToken ct)
    {
        var userId = GetUserIdFromJwt();
        if (userId == null) return Unauthorized();

        var contract = await _db.b_contracts
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.contractId == contractId, ct);

        if (contract == null) return NotFound("Contract not found.");

        if (contract.fkClientUserId != userId.Value && contract.fkProviderUserId != userId.Value)
            return Forbid();

        var rating = await _valuationService.GetRatingByContractIdAsync(contractId, ct);

        return Ok(new
        {
            contractId = rating.fkContractId,
            fromUserId = rating.fkFromUserId,
            toUserId = rating.fkToUserId,
            userRating = rating.userRating,
            userRatingComment = rating.userRatingComment,
            systemRating = rating.systemRating,
            systemRatingReason = rating.systemRatingReason,
            createdAt = rating.createdAt,
            updatedAt = rating.updatedAt
        });
    }

    [Authorize]
    [HttpPost("contract/{contractId:int}/system/recalculate")]
    public async Task<IActionResult> RecalculateSystemRating(int contractId, CancellationToken ct)
    {
        var userId = GetUserIdFromJwt();
        if (userId == null) return Unauthorized();

        var contract = await _db.b_contracts
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.contractId == contractId, ct);

        if (contract == null) return NotFound("Contract not found.");

        if (contract.fkClientUserId != userId.Value && contract.fkProviderUserId != userId.Value)
            return Forbid();

        try
        {
            var calc = await _valuationService.RecalculateSystemRatingAsync(contractId, ct);

            return Ok(new
            {
                message = "System rating recalculated successfully.",
                contractId,
                systemRating = calc.FinalRating,
                systemRatingReason = calc.ReasonText,
                breakdown = calc.Breakdown
            });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [Authorize]
    [HttpPost("contract/{contractId:int}/user")]
    public async Task<IActionResult> SubmitUserRating(
        int contractId,
        [FromBody] SubmitUserRatingDTO dto,
        CancellationToken ct)
    {
        var userId = GetUserIdFromJwt();
        if (userId == null) return Unauthorized();

        if (dto == null) return BadRequest("Request body is required.");

        try
        {
            var rating = await _valuationService.SubmitUserRatingAsync(
                contractId,
                userId.Value,
                dto.UserRating,
                dto.UserRatingComment,
                ct);

            var contract = await _db.b_contracts
                .AsNoTracking()
                .FirstAsync(c => c.contractId == contractId, ct);

            return Ok(new
            {
                message = "User rating submitted successfully.",
                contractId,
                userRating = rating.userRating,
                userRatingComment = rating.userRatingComment,
                systemRating = rating.systemRating,
                contractStatus = contract.status
            });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [Authorize]
    [HttpGet("my-pending")]
    public async Task<IActionResult> GetMyPendingRatings(CancellationToken ct)
    {
        var userId = GetUserIdFromJwt();
        if (userId == null) return Unauthorized();

        var list = await (
            from c in _db.b_contracts.AsNoTracking()
            join r in _db.b_ratings.AsNoTracking() on c.contractId equals r.fkContractId into ratingJoin
            from r in ratingJoin.DefaultIfEmpty()
            where c.fkClientUserId == userId.Value
               && (c.status == "Completed" || c.status == "Closed")
               && (r == null || r.userRating == null)
            select new
            {
                contractId = c.contractId,
                inquiryId = c.fkInquiryId,
                providerUserId = c.fkProviderUserId,
                status = c.status
            }
        ).ToListAsync(ct);

        return Ok(list);
    }

    private int? GetUserIdFromJwt()
    {
        var s =
            User.FindFirstValue("userId") ??
            User.FindFirstValue(ClaimTypes.NameIdentifier) ??
            User.FindFirstValue("sub");

        return int.TryParse(s, out var id) ? id : null;
    }

    public class SubmitUserRatingDTO
    {
        public int UserRating { get; set; }
        public string? UserRatingComment { get; set; }
    }
}