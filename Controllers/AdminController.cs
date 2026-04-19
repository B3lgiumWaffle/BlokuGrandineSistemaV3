using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BlokuGrandiniuSistema.DTOs;
using BlokuGrandiniuSistema.Models;
using BlokuGrandiniuSistema.Services;

namespace BlokuGrandiniuSistema.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AdminController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IValuationService _valuationService;

    public AdminController(AppDbContext db, IValuationService valuationService)
    {
        _db = db;
        _valuationService = valuationService;
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

    [HttpGet("disputes")]
    public async Task<IActionResult> GetDisputes(CancellationToken ct)
    {
        if (!IsAdmin()) return Forbid();

        var disputes = await (
            from f in _db.b_completed_listing_fragments.AsNoTracking()
            join c in _db.b_contracts.AsNoTracking() on f.fkContractId equals c.contractId
            join milestone in _db.b_contract_milestones.AsNoTracking() on f.fkMilestoneId equals milestone.milestoneId
            join inquiry in _db.b_inquiries.AsNoTracking() on c.fkInquiryId equals inquiry.inquiryId
            join listing in _db.b_listings.AsNoTracking() on inquiry.fk_listingId equals listing.listingId
            join provider in _db.b_users.AsNoTracking() on c.fkProviderUserId equals provider.UserId
            join client in _db.b_users.AsNoTracking() on c.fkClientUserId equals client.UserId
            where f.status == "Disputed"
            orderby f.updatedAt descending, f.submittedAt descending
            select new
            {
                fragmentId = f.fragmentId,
                contractId = c.contractId,
                contractStatus = c.status,
                milestoneId = milestone.milestoneId,
                milestoneNo = milestone.milestoneNo,
                title = f.title,
                status = f.status,
                submittedAt = f.submittedAt,
                disputedAt = f.updatedAt,
                providerUserId = provider.UserId,
                providerName = !string.IsNullOrWhiteSpace(provider.Username)
                    ? provider.Username
                    : ((provider.firstname ?? "") + " " + (provider.lastname ?? "")).Trim(),
                clientUserId = client.UserId,
                clientName = !string.IsNullOrWhiteSpace(client.Username)
                    ? client.Username
                    : ((client.firstname ?? "") + " " + (client.lastname ?? "")).Trim(),
                listingTitle = listing.Title
            })
            .ToListAsync(ct);

        return Ok(disputes);
    }

    [HttpGet("disputes/{fragmentId:int}")]
    public async Task<IActionResult> GetDisputeById(int fragmentId, CancellationToken ct)
    {
        if (!IsAdmin()) return Forbid();

        var dispute = await (
            from f in _db.b_completed_listing_fragments.AsNoTracking()
            join c in _db.b_contracts.AsNoTracking() on f.fkContractId equals c.contractId
            join milestone in _db.b_contract_milestones.AsNoTracking() on f.fkMilestoneId equals milestone.milestoneId
            join inquiry in _db.b_inquiries.AsNoTracking() on c.fkInquiryId equals inquiry.inquiryId
            join listing in _db.b_listings.AsNoTracking() on inquiry.fk_listingId equals listing.listingId
            join provider in _db.b_users.AsNoTracking() on c.fkProviderUserId equals provider.UserId
            join client in _db.b_users.AsNoTracking() on c.fkClientUserId equals client.UserId
            where f.fragmentId == fragmentId && f.status == "Disputed"
            select new
            {
                fragment = new
                {
                    fragmentId = f.fragmentId,
                    contractId = f.fkContractId,
                    milestoneId = f.fkMilestoneId,
                    requirementId = f.fkRequirementId,
                    title = f.title,
                    description = f.description,
                    filePath = f.filePath,
                    submittedByUserId = f.submittedByUserId,
                    submittedAt = f.submittedAt,
                    status = f.status,
                    reviewComment = f.reviewComment,
                    approvedByUserId = f.approvedByUserId,
                    approvedAt = f.approvedAt,
                    releaseTxHash = f.releaseTxHash,
                    createdAt = f.createdAt,
                    updatedAt = f.updatedAt
                },
                contract = new
                {
                    contractId = c.contractId,
                    inquiryId = c.fkInquiryId,
                    status = c.status,
                    agreedAmountEur = c.agreedAmountEur,
                    fundedAmountEth = c.fundedAmountEth,
                    milestoneCount = c.milestoneCount,
                    smartContractAddress = c.smartContractAddress,
                    chainProjectId = c.chainProjectId,
                    listingTitle = listing.Title
                },
                milestone = new
                {
                    milestoneId = milestone.milestoneId,
                    milestoneNo = milestone.milestoneNo,
                    status = milestone.status,
                    amountEurSnapshot = milestone.amountEurSnapshot,
                    amountEth = milestone.amountEth,
                    releaseTxHash = milestone.releaseTxHash,
                    releasedAt = milestone.releasedAt
                },
                provider = new
                {
                    userId = provider.UserId,
                    username = provider.Username,
                    email = provider.Email,
                    displayName = !string.IsNullOrWhiteSpace(provider.Username)
                        ? provider.Username
                        : ((provider.firstname ?? "") + " " + (provider.lastname ?? "")).Trim()
                },
                client = new
                {
                    userId = client.UserId,
                    username = client.Username,
                    email = client.Email,
                    displayName = !string.IsNullOrWhiteSpace(client.Username)
                        ? client.Username
                        : ((client.firstname ?? "") + " " + (client.lastname ?? "")).Trim()
                }
            })
            .FirstOrDefaultAsync(ct);

        if (dispute == null)
            return NotFound("Dispute not found.");

        var requirementId = dispute.fragment.requirementId as int?;
        var requirement = requirementId.HasValue
            ? await _db.b_requirements
                .AsNoTracking()
                .Where(r => r.requirementId == requirementId.Value)
                .Select(r => new
                {
                    requirementId = r.requirementId,
                    description = r.description,
                    fileUrl = r.fileUrl,
                    forseenCompletionDate = r.forseenCompletionDate
                })
                .FirstOrDefaultAsync(ct)
            : null;

        var relatedFragments = await _db.b_completed_listing_fragments
            .AsNoTracking()
            .Where(f => f.fkContractId == dispute.contract.contractId && f.fkMilestoneId == dispute.fragment.milestoneId)
            .OrderByDescending(f => f.submittedAt)
            .Select(f => new
            {
                fragmentId = f.fragmentId,
                title = f.title,
                status = f.status,
                submittedAt = f.submittedAt,
                approvedAt = f.approvedAt,
                reviewComment = f.reviewComment,
                filePath = f.filePath
            })
            .ToListAsync(ct);

        return Ok(new
        {
            dispute = new
            {
                dispute.fragment,
                dispute.contract,
                dispute.milestone,
                requirement,
                dispute.provider,
                dispute.client
            },
            relatedFragments
        });
    }

    [HttpPost("disputes/{fragmentId:int}/approve")]
    public async Task<IActionResult> ApproveDispute(int fragmentId, [FromBody] AdminResolveDisputeDTO? dto, CancellationToken ct)
    {
        if (!IsAdmin()) return Forbid();

        var adminUserId = GetUserIdFromJwt();
        if (adminUserId == null) return Unauthorized();

        var fragment = await _db.b_completed_listing_fragments
            .FirstOrDefaultAsync(f => f.fragmentId == fragmentId, ct);

        if (fragment == null) return NotFound("Fragment not found.");
        if (!string.Equals(fragment.status, "Disputed", StringComparison.OrdinalIgnoreCase))
            return BadRequest("Only disputed fragments can be approved by administrator.");

        var contract = await _db.b_contracts
            .FirstOrDefaultAsync(c => c.contractId == fragment.fkContractId, ct);

        if (contract == null) return NotFound("Contract not found.");

        var milestone = await _db.b_contract_milestones
            .FirstOrDefaultAsync(m => m.milestoneId == fragment.fkMilestoneId && m.fkContractId == contract.contractId, ct);

        if (milestone == null) return NotFound("Milestone not found.");

        await using var tx = await _db.Database.BeginTransactionAsync(ct);

        var oldFragmentStatus = fragment.status;
        var oldContractStatus = contract.status;
        var competingFragments = await _db.b_completed_listing_fragments
            .Where(f =>
                f.fkContractId == contract.contractId &&
                f.fkMilestoneId == milestone.milestoneId &&
                f.fragmentId != fragment.fragmentId &&
                (f.status == "Submitted" || f.status == "Disputed"))
            .ToListAsync(ct);

        fragment.status = "Submitted";
        fragment.approvedByUserId = adminUserId.Value;
        fragment.approvedAt = DateTime.UtcNow;
        fragment.releaseTxHash = null;
        fragment.updatedAt = DateTime.UtcNow;
        fragment.reviewComment = AppendAuditNote(
            fragment.reviewComment,
            string.IsNullOrWhiteSpace(dto?.ReviewComment)
                ? "Administrator approved the disputed fragment and returned it to the client for final approval."
                : $"Administrator approved the disputed fragment and returned it to the client for final approval. {dto!.ReviewComment!.Trim()}");

        milestone.status = "WaitingForApproval";
        milestone.updatedAt = DateTime.UtcNow;
        contract.status = "WaitingForApproval";
        contract.updatedAt = DateTime.UtcNow;

        _db.b_contract_histories.Add(new b_contract_history
        {
            fkContractId = contract.contractId,
            oldStatus = oldContractStatus,
            newStatus = contract.status,
            changedByUserId = adminUserId.Value,
            changedAt = DateTime.UtcNow,
            note = $"Administrator approved disputed fragment #{fragment.fragmentId} and returned it to the client for final approval."
        });

        _db.b_completed_list_fragment_histories.Add(new b_completed_list_fragment_history
        {
            fkContractId = contract.contractId,
            milestoneIndex = milestone.milestoneNo,
            oldStatus = oldFragmentStatus,
            newStatus = "Submitted",
            changedByUserId = adminUserId.Value,
            changedAt = DateTime.UtcNow,
            note = string.IsNullOrWhiteSpace(dto?.ReviewComment)
                ? "Administrator approved disputed fragment and returned it to the client for final approval."
                : $"Administrator approved disputed fragment and returned it to the client for final approval. {dto!.ReviewComment!.Trim()}",
            delayInDays = 0,
            isFinalState = false
        });

        foreach (var competingFragment in competingFragments)
        {
            var oldCompetingStatus = competingFragment.status;

            competingFragment.status = "Rejected";
            competingFragment.approvedByUserId = adminUserId.Value;
            competingFragment.approvedAt = DateTime.UtcNow;
            competingFragment.updatedAt = DateTime.UtcNow;
            competingFragment.reviewComment = AppendAuditNote(
                competingFragment.reviewComment,
                $"Administrator approved fragment #{fragment.fragmentId} for this milestone, so this competing fragment was closed as rejected.");

            _db.b_completed_list_fragment_histories.Add(new b_completed_list_fragment_history
            {
                fkContractId = contract.contractId,
                milestoneIndex = milestone.milestoneNo,
                oldStatus = oldCompetingStatus,
                newStatus = "Rejected",
                changedByUserId = adminUserId.Value,
                changedAt = DateTime.UtcNow,
                note = $"Closed because administrator approved fragment #{fragment.fragmentId} for the same milestone.",
                delayInDays = 0,
                isFinalState = true
            });
        }

        _db.b_notifications.Add(new b_notification
        {
            fkUserId = contract.fkProviderUserId,
            title = "Dispute approved",
            message = $"Administrator approved your disputed fragment for contract #{contract.contractId}. The client can now only approve it.",
            type = "contract_fragment_dispute_approved",
            referenceId = contract.contractId,
            isRead = false,
            createdAt = DateTime.UtcNow
        });

        _db.b_notifications.Add(new b_notification
        {
            fkUserId = contract.fkClientUserId,
            title = "Fragment returned for approval",
            message = $"Administrator approved the disputed fragment for contract #{contract.contractId}. You can approve it, but you can no longer reject it.",
            type = "contract_fragment_dispute_approved",
            referenceId = contract.contractId,
            isRead = false,
            createdAt = DateTime.UtcNow
        });

        await _db.SaveChangesAsync(ct);
        await tx.CommitAsync(ct);

        return Ok(new { message = "Dispute approved successfully and returned to client." });
    }

    [HttpPost("disputes/{fragmentId:int}/reject")]
    public async Task<IActionResult> RejectDispute(int fragmentId, [FromBody] AdminResolveDisputeDTO? dto, CancellationToken ct)
    {
        if (!IsAdmin()) return Forbid();

        var adminUserId = GetUserIdFromJwt();
        if (adminUserId == null) return Unauthorized();

        var fragment = await _db.b_completed_listing_fragments
            .FirstOrDefaultAsync(f => f.fragmentId == fragmentId, ct);

        if (fragment == null) return NotFound("Fragment not found.");
        if (!string.Equals(fragment.status, "Disputed", StringComparison.OrdinalIgnoreCase))
            return BadRequest("Only disputed fragments can be rejected by administrator.");

        var contract = await _db.b_contracts
            .FirstOrDefaultAsync(c => c.contractId == fragment.fkContractId, ct);

        if (contract == null) return NotFound("Contract not found.");

        var milestone = await _db.b_contract_milestones
            .FirstOrDefaultAsync(m => m.milestoneId == fragment.fkMilestoneId && m.fkContractId == contract.contractId, ct);

        if (milestone == null) return NotFound("Milestone not found.");

        await using var tx = await _db.Database.BeginTransactionAsync(ct);

        var oldStatus = fragment.status;
        fragment.status = "Rejected";
        fragment.approvedByUserId = adminUserId.Value;
        fragment.approvedAt = DateTime.UtcNow;
        fragment.updatedAt = DateTime.UtcNow;
        fragment.reviewComment = AppendAuditNote(
            fragment.reviewComment,
            string.IsNullOrWhiteSpace(dto?.ReviewComment)
                ? "Administrator kept the fragment rejected."
                : $"Administrator kept the fragment rejected. {dto!.ReviewComment!.Trim()}");

        milestone.status = "UnderRevision";
        milestone.updatedAt = DateTime.UtcNow;

        contract.status = "UnderRevision";
        contract.updatedAt = DateTime.UtcNow;

        _db.b_completed_list_fragment_histories.Add(new b_completed_list_fragment_history
        {
            fkContractId = contract.contractId,
            milestoneIndex = milestone.milestoneNo,
            oldStatus = oldStatus,
            newStatus = "Rejected",
            changedByUserId = adminUserId.Value,
            changedAt = DateTime.UtcNow,
            note = string.IsNullOrWhiteSpace(dto?.ReviewComment)
                ? "Administrator kept the disputed fragment rejected."
                : dto!.ReviewComment!.Trim(),
            delayInDays = 0,
            isFinalState = true
        });

        _db.b_notifications.Add(new b_notification
        {
            fkUserId = contract.fkProviderUserId,
            title = "Dispute rejected",
            message = $"Administrator kept your fragment rejected for contract #{contract.contractId}.",
            type = "contract_fragment_dispute_rejected",
            referenceId = contract.contractId,
            isRead = false,
            createdAt = DateTime.UtcNow
        });

        _db.b_notifications.Add(new b_notification
        {
            fkUserId = contract.fkClientUserId,
            title = "Dispute resolved",
            message = $"Administrator kept fragment rejected for contract #{contract.contractId}.",
            type = "contract_fragment_dispute_rejected",
            referenceId = contract.contractId,
            isRead = false,
            createdAt = DateTime.UtcNow
        });

        await _db.SaveChangesAsync(ct);
        await tx.CommitAsync(ct);

        return Ok(new { message = "Dispute rejected successfully." });
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

    private static string AppendAuditNote(string? currentText, string addition)
    {
        if (string.IsNullOrWhiteSpace(currentText))
            return addition;

        return $"{currentText.Trim()}{Environment.NewLine}{Environment.NewLine}{addition}";
    }
}
