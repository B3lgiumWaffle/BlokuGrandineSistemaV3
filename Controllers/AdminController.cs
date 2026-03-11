using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BlokuGrandiniuSistema.Models;

namespace BlokuGrandiniuSistema.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AdminController : ControllerBase
{
    private readonly AppDbContext _db;

    public AdminController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet("listings")]
    public async Task<IActionResult> GetListings(CancellationToken ct)
    {
        if (!IsAdmin()) return Forbid();

        var items = await _db.b_listings
            .AsNoTracking()
            .OrderByDescending(l => l.UploadTime)
            .Select(l => new
            {
                listingId = l.listingId,
                title = l.Title,
                description = l.Description,
                priceFrom = l.PriceFrom,
                priceTo = l.PriceTo,
                completionTime = l.CompletionTime,
                uploadTime = l.UploadTime,
                categoryId = l.CategoryId,
                ownerUserId = l.userId,
                isActivated = l.isActivated,
                adminComment = l.adminComment,
                reviewedAt = l.reviewedAt,
                fkReviewedByUserId = l.fkReviewedByUserId
            })
            .ToListAsync(ct);

        return Ok(items);
    }

    [HttpGet("listings/pending")]
    public async Task<IActionResult> GetPendingListings(CancellationToken ct)
    {
        if (!IsAdmin()) return Forbid();

        var items = await _db.b_listings
            .AsNoTracking()
            .Where(l => l.isActivated == 0)
            .OrderByDescending(l => l.UploadTime)
            .Select(l => new
            {
                listingId = l.listingId,
                title = l.Title,
                description = l.Description,
                priceFrom = l.PriceFrom,
                priceTo = l.PriceTo,
                completionTime = l.CompletionTime,
                uploadTime = l.UploadTime,
                categoryId = l.CategoryId,
                ownerUserId = l.userId,
                isActivated = l.isActivated,
                adminComment = l.adminComment,
                reviewedAt = l.reviewedAt,
                fkReviewedByUserId = l.fkReviewedByUserId
            })
            .ToListAsync(ct);

        return Ok(items);
    }

    [HttpGet("listings/{listingId:int}")]
    public async Task<IActionResult> GetListingById(int listingId, CancellationToken ct)
    {
        if (!IsAdmin()) return Forbid();

        var baseUrl = $"{Request.Scheme}://{Request.Host}";

        var listing = await _db.b_listings
            .AsNoTracking()
            .Where(l => l.listingId == listingId)
            .Select(l => new
            {
                listingId = l.listingId,
                title = l.Title,
                description = l.Description,
                priceFrom = l.PriceFrom,
                priceTo = l.PriceTo,
                completionTime = l.CompletionTime,
                uploadTime = l.UploadTime,
                categoryId = l.CategoryId,
                ownerUserId = l.userId,
                isActivated = l.isActivated,
                adminComment = l.adminComment,
                reviewedAt = l.reviewedAt,
                fkReviewedByUserId = l.fkReviewedByUserId
            })
            .FirstOrDefaultAsync(ct);

        if (listing == null) return NotFound("Listing not found.");

        var photos = await _db.b_listing_photos
            .AsNoTracking()
            .Where(p => p.listingId == listingId)
            .OrderByDescending(p => p.IsPrimary)
            .ThenByDescending(p => p.UploadTime)
            .Select(p => new
            {
                photoId = p.photoId,
                listingId = p.listingId,
                isPrimary = p.IsPrimary,
                uploadTime = p.UploadTime,
                photoUrl = string.IsNullOrWhiteSpace(p.PhotoUrl) ? null : $"{baseUrl}{p.PhotoUrl}"
            })
            .ToListAsync(ct);

        return Ok(new
        {
            item = listing,
            photos
        });
    }

    [HttpPost("listings/{listingId:int}/approve")]
    public async Task<IActionResult> ApproveListing(int listingId, CancellationToken ct)
    {
        if (!IsAdmin()) return Forbid();

        var adminUserId = GetUserIdFromJwt();
        if (adminUserId == null) return Unauthorized();

        var listing = await _db.b_listings.FirstOrDefaultAsync(l => l.listingId == listingId, ct);
        if (listing == null) return NotFound("Listing not found.");

        listing.isActivated = 1;
        listing.adminComment = null;
        listing.reviewedAt = DateTime.UtcNow;
        listing.fkReviewedByUserId = adminUserId.Value;

        _db.b_notifications.Add(new b_notification
        {
            fkUserId = listing.userId,
            title = "Listing approved",
            message = "Your listing was approved by admin.",
            type = "ListingApproved",
            referenceId = listing.listingId,
            isRead = false,
            createdAt = DateTime.UtcNow
        });

        await _db.SaveChangesAsync(ct);

        return Ok(new { message = "Listing approved." });
    }

    public class RejectListingDto
    {
        public string? Comment { get; set; }
    }

    [HttpPost("listings/{listingId:int}/reject")]
    public async Task<IActionResult> RejectListing(int listingId, [FromBody] RejectListingDto dto, CancellationToken ct)
    {
        if (!IsAdmin()) return Forbid();

        var adminUserId = GetUserIdFromJwt();
        if (adminUserId == null) return Unauthorized();

        if (string.IsNullOrWhiteSpace(dto.Comment))
            return BadRequest(new { message = "Comment is required." });

        var listing = await _db.b_listings.FirstOrDefaultAsync(l => l.listingId == listingId, ct);
        if (listing == null) return NotFound("Listing not found.");

        listing.isActivated = 0;
        listing.adminComment = dto.Comment.Trim();
        listing.reviewedAt = DateTime.UtcNow;
        listing.fkReviewedByUserId = adminUserId.Value;

        _db.b_notifications.Add(new b_notification
        {
            fkUserId = listing.userId,
            title = "Listing rejected",
            message = dto.Comment.Trim(),
            type = "ListingRejected",
            referenceId = listing.listingId,
            isRead = false,
            createdAt = DateTime.UtcNow
        });

        await _db.SaveChangesAsync(ct);

        return Ok(new { message = "Listing rejected." });
    }

    [HttpGet("users")]
    public async Task<IActionResult> GetUsers(CancellationToken ct)
    {
        if (!IsAdmin()) return Forbid();

        var users = await _db.b_users
            .AsNoTracking()
            .Include(u => u.Role)
            .OrderBy(u => u.UserId)
            .Select(u => new
            {
                userId = u.UserId,
                username = u.Username,
                email = u.Email,
                role = u.Role != null ? u.Role.RoleName : null
            })
            .ToListAsync(ct);

        return Ok(users);
    }

    [HttpGet("users/{userId:int}")]
    public async Task<IActionResult> GetUserById(int userId, CancellationToken ct)
    {
        if (!IsAdmin()) return Forbid();

        var user = await _db.b_users
            .AsNoTracking()
            .Include(u => u.Role)
            .Where(u => u.UserId == userId)
            .Select(u => new
            {
                userId = u.UserId,
                username = u.Username,
                email = u.Email,
                role = u.Role != null ? u.Role.RoleName : null
            })
            .FirstOrDefaultAsync(ct);

        if (user == null) return NotFound("User not found.");

        var listings = await _db.b_listings
            .AsNoTracking()
            .Where(l => l.userId == userId)
            .OrderByDescending(l => l.UploadTime)
            .Select(l => new
            {
                listingId = l.listingId,
                title = l.Title,
                isActivated = l.isActivated,
                uploadTime = l.UploadTime,
                adminComment = l.adminComment
            })
            .ToListAsync(ct);

        return Ok(new
        {
            user,
            listings
        });
    }

    private bool IsAdmin()
    {
        var role =
            User.FindFirstValue(ClaimTypes.Role) ??
            User.FindFirstValue("role") ??
            User.FindFirstValue("http://schemas.microsoft.com/ws/2008/06/identity/claims/role");

        return role == "Admin";
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