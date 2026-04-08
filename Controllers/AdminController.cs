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

        var ratingsSummary = await BuildUserRatingsSummary(userId, ct);

        return Ok(new
        {
            user,
            ratings = ratingsSummary,
            listings
        });
    }

    [HttpDelete("users/{userId:int}")]
    public async Task<IActionResult> DeleteUser(int userId, CancellationToken ct)
    {
        if (!IsAdmin()) return Forbid();

        var currentAdminId = GetUserIdFromJwt();
        if (currentAdminId == null) return Unauthorized();

        if (currentAdminId.Value == userId)
            return BadRequest(new { message = "You cannot delete your own admin profile." });

        var user = await _db.b_users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.UserId == userId, ct);

        if (user == null)
            return NotFound(new { message = "User not found." });

        if (user.Role != null && user.Role.RoleName == "Admin")
            return BadRequest(new { message = "Admin profile cannot be deleted." });

        var listingIds = await _db.b_listings
            .Where(l => l.userId == userId)
            .Select(l => l.listingId)
            .ToListAsync(ct);

        var contractIds = await _db.b_contracts
            .Where(c => c.fkClientUserId == userId || c.fkProviderUserId == userId)
            .Select(c => c.contractId)
            .ToListAsync(ct);

        var inquiryIds = await _db.b_inquiries
            .Where(i => i.fk_userId == userId || listingIds.Contains(i.fk_listingId))
            .Select(i => i.inquiryId)
            .ToListAsync(ct);

        await using var tx = await _db.Database.BeginTransactionAsync(ct);

        try
        {
            // direct user-linked data
            var notifications = await _db.b_notifications
                .Where(x => x.fkUserId == userId)
                .ToListAsync(ct);
            _db.b_notifications.RemoveRange(notifications);

            var ratings = await _db.b_ratings
                .Where(x =>
                    x.fkFromUserId == userId ||
                    x.fkToUserId == userId ||
                    contractIds.Contains(x.fkContractId) ||
                    listingIds.Contains(x.fkListingId))
                .ToListAsync(ct);
            _db.b_ratings.RemoveRange(ratings);

            var comments = await _db.b_comments
                .Where(x =>
                    x.fkUserId == userId ||
                    contractIds.Contains(x.fkContractId) ||
                    listingIds.Contains(x.fkListingId))
                .ToListAsync(ct);
            _db.b_comments.RemoveRange(comments);

            var contractMessages = await _db.b_contract_messages
                .Where(x =>
                    x.fkSenderUserId == userId ||
                    x.fkReceiverUserId == userId ||
                    contractIds.Contains(x.fkContractId))
                .ToListAsync(ct);
            _db.b_contract_messages.RemoveRange(contractMessages);

            var oldMessages = await _db.b_contract_messages
                .Where(x =>
                    x.fkSenderUserId == userId ||
                    x.fkReceiverUserId == userId ||
                    contractIds.Contains(x.fkContractId))
                .ToListAsync(ct);
            _db.b_contract_messages.RemoveRange(oldMessages);

            var fragmentHistory = await _db.b_completed_list_fragment_histories
                .Where(x =>
                    x.changedByUserId == userId ||
                    contractIds.Contains(x.fkContractId))
                .ToListAsync(ct);
            _db.b_completed_list_fragment_histories.RemoveRange(fragmentHistory);

            var fragments = await _db.b_completed_listing_fragments
                .Where(x =>
                    x.submittedByUserId == userId ||
                    x.approvedByUserId == userId ||
                    contractIds.Contains(x.fkContractId))
                .ToListAsync(ct);
            _db.b_completed_listing_fragments.RemoveRange(fragments);

            var contractHistory = await _db.b_contract_histories
                .Where(x =>
                    x.changedByUserId == userId ||
                    contractIds.Contains(x.fkContractId))
                .ToListAsync(ct);
            _db.b_contract_histories.RemoveRange(contractHistory);

            // contracts first
            var contracts = await _db.b_contracts
                .Where(x => contractIds.Contains(x.contractId))
                .ToListAsync(ct);
            _db.b_contracts.RemoveRange(contracts);

            // inquiries and requirements
            var requirements = await _db.b_requirements
                .Where(x => inquiryIds.Contains(x.fk_inquiryId))
                .ToListAsync(ct);
            _db.b_requirements.RemoveRange(requirements);

            var inquiries = await _db.b_inquiries
                .Where(x => inquiryIds.Contains(x.inquiryId))
                .ToListAsync(ct);
            _db.b_inquiries.RemoveRange(inquiries);

            // listings and photos
            var listingPhotos = await _db.b_listing_photos
                .Where(x => listingIds.Contains(x.listingId))
                .ToListAsync(ct);
            _db.b_listing_photos.RemoveRange(listingPhotos);

            var listings = await _db.b_listings
                .Where(x => listingIds.Contains(x.listingId))
                .ToListAsync(ct);
            _db.b_listings.RemoveRange(listings);

            _db.b_users.Remove(user);

            await _db.SaveChangesAsync(ct);
            await tx.CommitAsync(ct);

            return Ok(new { message = "User profile deleted successfully." });
        }
        catch (Exception ex)
        {
            await tx.RollbackAsync(ct);
            return BadRequest(new
            {
                message = "Failed to delete user profile.",
                error = ex.Message
            });
        }
    }

    private async Task<object> BuildUserRatingsSummary(int userId, CancellationToken ct)
    {
        var userRatings = await _db.b_ratings
            .AsNoTracking()
            .Where(r => r.fkToUserId == userId)
            .ToListAsync(ct);

        var userRatingValues = userRatings
            .Where(r => r.userRating.HasValue)
            .Select(r => (decimal)r.userRating!.Value)
            .ToList();

        var systemRatingValues = userRatings
            .Where(r => r.systemRating.HasValue)
            .Select(r => r.systemRating!.Value)
            .ToList();

        decimal? userRatingAverage = userRatingValues.Count > 0
            ? Math.Round(userRatingValues.Average(), 2)
            : null;

        decimal? systemRatingAverage = systemRatingValues.Count > 0
            ? Math.Round(systemRatingValues.Average(), 2)
            : null;

        int dangerPoints = 0;

        if (systemRatingAverage.HasValue && systemRatingAverage.Value <= 1m)
            dangerPoints++;

        if (userRatingAverage.HasValue && userRatingAverage.Value <= 1m)
            dangerPoints++;

        var dangerLabel = dangerPoints switch
        {
            >= 2 => "ExtraDangerous",
            1 => "Dangerous",
            _ => "Safe"
        };

        return new
        {
            totalRatings = userRatings.Count,
            userRatingAverage,
            systemRatingAverage,
            dangerPoints,
            dangerLabel
        };
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