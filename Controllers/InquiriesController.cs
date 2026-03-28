using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using BlokuGrandiniuSistema.DTOs;
using BlokuGrandiniuSistema.Services;
using BlokuGrandiniuSistema.Models;
using System.Globalization;

namespace BlokuGrandiniuSistema.Controllers;

    [ApiController]
    [Route("api/[controller]")]
    public class InquiriesController : ControllerBase
    {
    private readonly AppDbContext _db;
    private readonly IFileStorage _files;
    private readonly IValuationService _valuationService;

    public InquiriesController(AppDbContext db, IFileStorage files, IValuationService valuationService)
    {
        _db = db;
        _files = files;
        _valuationService = valuationService;
    }

    // ---------------------------
    // CREATE (Sender creates inquiry)
    // POST api/inquiries
    // ---------------------------
    [Authorize]
        [HttpPost]
        [Consumes("multipart/form-data")]
        public async Task<ActionResult<InquiryDetailsDTO>> Create([FromForm] InquiryCreateDTO dto, CancellationToken ct)
        {
            var userId = GetUserIdFromJwt();
            if (userId == null) return Unauthorized();

            if (dto.FkListingId <= 0) return BadRequest("FkListingId is required.");
            if (string.IsNullOrWhiteSpace(dto.Description)) return BadRequest("Description is required.");
            if (dto.Requirements == null || dto.Requirements.Count == 0) return BadRequest("At least one requirement is required.");

            var listing = await _db.b_listings
                .AsNoTracking()
                .FirstOrDefaultAsync(l => l.listingId == dto.FkListingId, ct);

            if (listing == null) return NotFound("Listing not found.");

            var inquiry = new b_inquiry
            {
                fk_listingId = dto.FkListingId,
                fk_userId = userId.Value,
                description = dto.Description.Trim(),
                proposedSum = dto.ProposedSum,
                creationDate = DateTime.UtcNow,
                isConfirmed = false,

                // NEW flags (must exist in entity)
                lastModifiedBy = "SENDER",
                ownerSeen = false,
                senderSeen = true,

                // optional
                // Status = "PENDING"
            };

            _db.b_inquiries.Add(inquiry);
            await _db.SaveChangesAsync(ct);

            foreach (var r in dto.Requirements)
            {
                if (string.IsNullOrWhiteSpace(r.Description)) continue;

                string? url = null;
                if (r.File != null && r.File.Length > 0)
                    url = await _files.SaveRequirementFileAsync(r.File, ct);

                var req = new b_requirement
                {
                    fk_inquiryId = inquiry.inquiryId,
                    description = r.Description.Trim(),
                    fileUrl = url,
                    forseenCompletionDate = r.ForseenCompletionDate.HasValue
                        ? DateOnly.FromDateTime(r.ForseenCompletionDate.Value)
                        : null
                };

                _db.b_requirements.Add(req);
            }

            await _db.SaveChangesAsync(ct);

            var details = await BuildDetails(inquiry.inquiryId, ct);
            return CreatedAtAction(nameof(GetById), new { id = inquiry.inquiryId }, details);
        }

        // ---------------------------
        // GET details (both roles use)
        // GET api/inquiries/{id}
        // ---------------------------
        [Authorize]
        [HttpGet("{id:int}")]
        public async Task<ActionResult<InquiryDetailsDTO>> GetById(int id, CancellationToken ct)
        {
            // allow only sender or listing owner
            var userId = GetUserIdFromJwt();
            if (userId == null) return Unauthorized();

            var inquiry = await _db.b_inquiries.AsNoTracking().FirstOrDefaultAsync(x => x.inquiryId == id, ct);
            if (inquiry == null) return NotFound();

            var listingOwnerId = await _db.b_listings
                .AsNoTracking()
                .Where(l => l.listingId == inquiry.fk_listingId)
                .Select(l => (int?)l.userId)
                .FirstOrDefaultAsync(ct);

            if (listingOwnerId == null) return NotFound("Listing not found.");

            var isOwner = listingOwnerId == userId;
            var isSender = inquiry.fk_userId == userId;

            if (!isOwner && !isSender) return Forbid();

            var dto = await BuildDetails(id, ct);
            return Ok(dto);
        }

        // ---------------------------
        // OWNER inbox grouped by listing
        // GET api/inquiries/for-my-listings
        // ---------------------------
        [Authorize]
        [HttpGet("for-my-listings")]
        public async Task<ActionResult<List<object>>> ForMyListings(CancellationToken ct)
        {
            var userId = GetUserIdFromJwt();
            if (userId == null) return Unauthorized();

            var result = await _db.b_listings
                .AsNoTracking()
                .Where(l => l.userId == userId.Value)
                .Select(l => new
                {
                    listingId = l.listingId,
                    listingTitle = l.Title,
                    inquiries = _db.b_inquiries
                        .AsNoTracking()
                        .Where(i => i.fk_listingId == l.listingId)
                        .OrderByDescending(i => i.creationDate)
                        .Select(i => new
                        {
                            inquiryId = i.inquiryId,
                            fkListingId = i.fk_listingId,
                            proposedSum = i.proposedSum,
                            description = i.description,
                            creationDate = i.creationDate,
                            isConfirmed = i.isConfirmed,
                            lastModifiedBy = i.lastModifiedBy,
                            ownerSeen = i.ownerSeen,
                            senderSeen = i.senderSeen,
                            // status = i.Status
                        })
                        .ToList()
                })
                .ToListAsync(ct);

            return Ok(result);
        }

        // ---------------------------
        // SENDER list (my sent)
        // GET api/inquiries/my-sent
        // ---------------------------
        [Authorize]
        [HttpGet("my-sent")]
        public async Task<ActionResult<List<InquiryListItemDTO>>> MySent(CancellationToken ct)
        {
            var userId = GetUserIdFromJwt();
            if (userId == null) return Unauthorized();

            var list = await _db.b_inquiries
                .AsNoTracking()
                .Where(i => i.fk_userId == userId.Value)
                .OrderByDescending(i => i.creationDate)
                .Select(i => new InquiryListItemDTO
                {
                    InquiryId = i.inquiryId,
                    FkListingId = i.fk_listingId,
                    ListingTitle = _db.b_listings.Where(l => l.listingId == i.fk_listingId).Select(l => l.Title).FirstOrDefault() ?? "Untitled listing",
                    ProposedSum = i.proposedSum,
                    Description = i.description,
                    CreationDate = i.creationDate,
                    IsConfirmed = i.isConfirmed,
                    LastModifiedBy = i.lastModifiedBy,
                    OwnerSeen = i.ownerSeen,
                    SenderSeen = i.senderSeen,
                    // Status = i.Status
                })
                .ToListAsync(ct);

            return Ok(list);
        }

        // ---------------------------
        // Seen flags
        // Owner opens -> set OwnerSeen = 1
        // POST api/inquiries/{id}/seen-owner
        // ---------------------------
        [Authorize]
        [HttpPost("{id:int}/seen-owner")]
        public async Task<IActionResult> SeenOwner(int id, CancellationToken ct)
        {
            var userId = GetUserIdFromJwt();
            if (userId == null) return Unauthorized();

            var inquiry = await _db.b_inquiries.FirstOrDefaultAsync(i => i.inquiryId == id, ct);
            if (inquiry == null) return NotFound();

            var ownerId = await _db.b_listings
                .Where(l => l.listingId == inquiry.fk_listingId)
                .Select(l => (int?)l.userId)
                .FirstOrDefaultAsync(ct);

            if (ownerId == null) return NotFound("Listing not found.");
            if (ownerId != userId.Value) return Forbid();

            inquiry.ownerSeen = true;
            await _db.SaveChangesAsync(ct);
            return NoContent();
        }

        // Sender opens -> set SenderSeen = 1
        // POST api/inquiries/{id}/seen-sender
        [Authorize]
        [HttpPost("{id:int}/seen-sender")]
        public async Task<IActionResult> SeenSender(int id, CancellationToken ct)
        {
            var userId = GetUserIdFromJwt();
            if (userId == null) return Unauthorized();

            var inquiry = await _db.b_inquiries.FirstOrDefaultAsync(i => i.inquiryId == id, ct);
            if (inquiry == null) return NotFound();
            if (inquiry.fk_userId != userId.Value) return Forbid();

            inquiry.senderSeen = true;
            await _db.SaveChangesAsync(ct);
            return NoContent();
        }

        // ---------------------------
        // MODIFY by OWNER
        // PUT api/inquiries/{id}
        // ---------------------------
        [Authorize]
        [HttpPut("{id:int}")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UpdateByOwner(int id, [FromForm] InquiryUpdateDTO dto, CancellationToken ct)
        {
        var userId = GetUserIdFromJwt();
        if (userId == null) return Unauthorized();

        // ✅ Inquiry description (string) tikrinimas
        if (string.IsNullOrWhiteSpace(dto.Description))
            return BadRequest("Description is required.");

        // ✅ Requirements (List<RequirementUpdateDTO>) tikrinimas
        if (dto.Requirements == null || dto.Requirements.Count == 0)
            return BadRequest("At least one requirement is required.");

        // ✅ Tikrinam, kad nebūtų tuščių requirement aprašymų
        if (dto.Requirements.Any(r => string.IsNullOrWhiteSpace(r.Description)))
            return BadRequest("Requirements cannot contain empty descriptions.");

        // (optional) jei nori uždrausti praeities datą
        // if (dto.Requirements.Any(r => r.ForseenCompletionDate.HasValue && r.ForseenCompletionDate.Value.Date < DateTime.UtcNow.Date))
        //     return BadRequest("ForseenCompletionDate cannot be in the past.");

        var inquiry = await _db.b_inquiries.FirstOrDefaultAsync(i => i.inquiryId == id, ct);
        if (inquiry == null) return NotFound();

        var ownerId = await _db.b_listings
            .Where(l => l.listingId == inquiry.fk_listingId)
            .Select(l => (int?)l.userId)
            .FirstOrDefaultAsync(ct);

        if (ownerId == null) return NotFound("Listing not found.");
        if (ownerId != userId.Value) return Forbid();

        await ApplyUpdate(inquiry, dto, modifiedBy: "OWNER", ct);
            return NoContent();
        }

        // ---------------------------
        // MODIFY by SENDER
        // PUT api/inquiries/{id}/sender
        // ---------------------------
        [Authorize]
        [HttpPut("{id:int}/sender")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UpdateBySender(int id, [FromForm] InquiryUpdateDTO dto, CancellationToken ct)
        {

            var userId = GetUserIdFromJwt();
            if (userId == null) return Unauthorized();

            if (string.IsNullOrWhiteSpace(dto.Description)) return BadRequest("Description is required.");
            if (dto.Requirements == null || dto.Requirements.Count == 0) return BadRequest("At least one requirement is required.");


            var inquiry = await _db.b_inquiries.FirstOrDefaultAsync(i => i.inquiryId == id, ct);
            if (inquiry == null) return NotFound();
            if (inquiry.isConfirmed) return BadRequest("Inquiry is already accepted.");
            if (inquiry.fk_userId != userId.Value) return Forbid();

                await ApplyUpdate(inquiry, dto, modifiedBy: "SENDER", ct);
                return NoContent();
        }

    // ---------------------------
    // ACCEPT by OWNER (accept inquiry)
    // POST api/inquiries/{id}/accept-owner
    // ---------------------------
    [Authorize]
    [HttpPost("{id:int}/accept-owner")]
    public async Task<IActionResult> AcceptOwner(int id, CancellationToken ct)
    {
        var userId = GetUserIdFromJwt();
        if (userId == null) return Unauthorized();

        var inquiry = await _db.b_inquiries.FirstOrDefaultAsync(i => i.inquiryId == id, ct);
        if (inquiry == null) return NotFound();

        var ownerId = await _db.b_listings
            .Where(l => l.listingId == inquiry.fk_listingId)
            .Select(l => (int?)l.userId)
            .FirstOrDefaultAsync(ct);

        if (ownerId == null) return NotFound("Listing not found.");
        if (ownerId != userId.Value) return Forbid();

        // ✅ NEGALIMA accept, jei paskutinis modifikavo OWNER
        if (string.Equals(inquiry.lastModifiedBy, "OWNER", StringComparison.OrdinalIgnoreCase))
            return BadRequest("You cannot accept right after modifying. Wait for sender to accept your changes.");

        inquiry.isConfirmed = true;

        inquiry.lastModifiedBy = "OWNER";
        inquiry.senderSeen = false;
        inquiry.ownerSeen = true;

        await _db.SaveChangesAsync(ct);
        return NoContent();
    }

    // ---------------------------
    // ACCEPT by SENDER (acknowledge / accept latest changes)
    // POST api/inquiries/{id}/accept-sender
    // ---------------------------
    [Authorize]
    [HttpPost("{id:int}/accept-sender")]
    public async Task<IActionResult> AcceptSender(int id, CancellationToken ct)
    {
        var userId = GetUserIdFromJwt();
        if (userId == null) return Unauthorized();

        var inquiry = await _db.b_inquiries.FirstOrDefaultAsync(i => i.inquiryId == id, ct);
        if (inquiry == null) return NotFound();
        if (inquiry.fk_userId != userId.Value) return Forbid();

        // ✅ NEGALIMA accept, jei paskutinis modifikavo SENDER (t.y. tu pats)
        if (!string.Equals(inquiry.lastModifiedBy, "OWNER", StringComparison.OrdinalIgnoreCase))
            return BadRequest("Nothing to accept. Owner has not modified since your last change.");

        // "I accept owner's modifications"
        inquiry.lastModifiedBy = "SENDER";
        inquiry.ownerSeen = false;
        inquiry.senderSeen = true;

        await _db.SaveChangesAsync(ct);
        return NoContent();
    }

    // ---------------------------
    // DELETE (Decline = delete)
    // DELETE api/inquiries/{id}
    // allow sender OR listing owner
    // ---------------------------
    [Authorize]
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id, CancellationToken ct)
        {
            var userId = GetUserIdFromJwt();
            if (userId == null) return Unauthorized();

            var inquiry = await _db.b_inquiries.FirstOrDefaultAsync(i => i.inquiryId == id, ct);
            if (inquiry == null) return NotFound();

            var ownerId = await _db.b_listings
                .Where(l => l.listingId == inquiry.fk_listingId)
                .Select(l => (int?)l.userId)
                .FirstOrDefaultAsync(ct);

            var isOwner = ownerId == userId.Value;
            var isSender = inquiry.fk_userId == userId.Value;

            if (!isOwner && !isSender) return Forbid();

            _db.b_inquiries.Remove(inquiry);
            await _db.SaveChangesAsync(ct); // requirements deleted via ON DELETE CASCADE
            return NoContent();
        }

    // ---------------------------
    // REJECT submitted fragment by client
    // POST api/inquiries/contracts/{contractId}/fragments/{fragmentId}/reject
    // ---------------------------
    [Authorize]
    [HttpPost("contracts/{contractId:int}/fragments/{fragmentId:int}/reject")]
    public async Task<IActionResult> RejectFragment(
        int contractId,
        int fragmentId,
        [FromBody] RejectFragmentDTO dto,
        CancellationToken ct)
    {
        var userId = GetUserIdFromJwt();
        if (userId == null) return Unauthorized();

        var contract = await _db.b_contracts
            .FirstOrDefaultAsync(c => c.contractId == contractId, ct);

        if (contract == null) return NotFound("Contract not found.");
        if (contract.fkClientUserId != userId.Value) return Forbid();

        var fragment = await _db.b_completed_listing_fragments
            .FirstOrDefaultAsync(f => f.fragmentId == fragmentId && f.fkContractId == contractId, ct);

        if (fragment == null) return NotFound("Fragment not found.");

        if (!string.Equals(fragment.status, "Submitted", StringComparison.OrdinalIgnoreCase))
            return BadRequest("Only submitted fragments can be rejected.");

        var milestone = await _db.b_contract_milestones
            .FirstOrDefaultAsync(m => m.milestoneId == fragment.fkMilestoneId && m.fkContractId == contractId, ct);

        if (milestone == null) return NotFound("Milestone not found.");

        await using var tx = await _db.Database.BeginTransactionAsync(ct);

        var oldFragmentStatus = fragment.status;
        var oldContractStatus = contract.status;
        var oldMilestoneStatus = milestone.status;

        fragment.status = "Rejected";
        fragment.reviewComment = string.IsNullOrWhiteSpace(dto?.ReviewComment)
            ? "Rejected by client. Please revise and resubmit."
            : dto.ReviewComment.Trim();
        fragment.approvedByUserId = userId.Value;
        fragment.approvedAt = DateTime.UtcNow;

        milestone.status = "UnderRevision";

        contract.status = "UnderRevision";
        contract.updatedAt = DateTime.UtcNow;

        _db.b_contract_histories.Add(new b_contract_history
        {
            fkContractId = contract.contractId,
            oldStatus = oldContractStatus,
            newStatus = contract.status,
            changedByUserId = userId.Value,
            changedAt = DateTime.UtcNow,
            note = $"Fragment #{fragment.fragmentId} rejected by client."
        });

        _db.b_completed_list_fragment_histories.Add(new b_completed_list_fragment_history
        {
            fkContractId = contract.contractId,
            milestoneIndex = milestone.milestoneNo,
            oldStatus = oldFragmentStatus,
            newStatus = "Rejected",
            changedByUserId = userId.Value,
            changedAt = DateTime.UtcNow,
            note = fragment.reviewComment,
            delayInDays = CalculateDelayInDays(fragment.submittedAt, await GetMilestoneDeadline(milestone.fkRequirementId, ct)),
            isFinalState = false
        });

        _db.b_notifications.Add(new b_notification
        {
            fkUserId = contract.fkProviderUserId,
            title = "Fragment rejected",
            message = $"Your fragment for contract #{contract.contractId} was rejected. Please revise and resubmit.",
            type = "contract_fragment_rejected",
            referenceId = contract.contractId,
            isRead = false,
            createdAt = DateTime.UtcNow
        });

        await _db.SaveChangesAsync(ct);
        await tx.CommitAsync(ct);

        return Ok(new
        {
            message = "Fragment rejected successfully.",
            contractStatus = contract.status,
            fragmentStatus = fragment.status,
            milestoneStatus = milestone.status
        });
    }

    // ---------------------------
    // APPROVE submitted fragment by client + settle payout rules
    // POST api/inquiries/contracts/{contractId}/fragments/{fragmentId}/approve
    // ---------------------------
    [Authorize]
    [HttpPost("contracts/{contractId:int}/fragments/{fragmentId:int}/approve")]
    public async Task<IActionResult> ApproveFragment(
        int contractId,
        int fragmentId,
        [FromBody] ApproveFragmentDTO dto,
        CancellationToken ct)
    {
        var userId = GetUserIdFromJwt();
        if (userId == null) return Unauthorized();

        var contract = await _db.b_contracts
            .FirstOrDefaultAsync(c => c.contractId == contractId, ct);

        if (contract == null) return NotFound("Contract not found.");
        if (contract.fkClientUserId != userId.Value) return Forbid();

        var fragment = await _db.b_completed_listing_fragments
            .FirstOrDefaultAsync(f => f.fragmentId == fragmentId && f.fkContractId == contractId, ct);

        if (fragment == null) return NotFound("Fragment not found.");

        if (!string.Equals(fragment.status, "Submitted", StringComparison.OrdinalIgnoreCase))
            return BadRequest("Only submitted fragments can be approved.");

        var milestone = await _db.b_contract_milestones
            .FirstOrDefaultAsync(m => m.milestoneId == fragment.fkMilestoneId && m.fkContractId == contractId, ct);

        if (milestone == null) return NotFound("Milestone not found.");

        var requirementDeadline = await GetMilestoneDeadline(milestone.fkRequirementId, ct);
        var contractDeadline = await GetContractDeadline(contract.fkInquiryId, ct);

        var submissionCount = await _db.b_completed_listing_fragments
            .CountAsync(f => f.fkContractId == contractId && f.fkMilestoneId == milestone.milestoneId, ct);

        var isLastMilestone = await IsLastMilestone(contractId, milestone.milestoneNo, ct);

        var isLateForRequirement = requirementDeadline.HasValue && fragment.submittedAt.Date > requirementDeadline.Value.Date;
        var isLateForContractEnd = isLastMilestone && contractDeadline.HasValue && fragment.submittedAt.Date > contractDeadline.Value.Date;
        var tooManyAttempts = submissionCount > 3;

        var shouldSplit50_50 = isLateForRequirement || isLateForContractEnd || tooManyAttempts;

        var expectedFullAmount = milestone.amountEth ?? 0m;
        var expectedProviderAmountEth = shouldSplit50_50
            ? Math.Round(expectedFullAmount / 2m, 8, MidpointRounding.AwayFromZero)
            : expectedFullAmount;

        var expectedClientRefundAmountEth = Math.Round(expectedFullAmount - expectedProviderAmountEth, 8, MidpointRounding.AwayFromZero);

        if (dto == null || string.IsNullOrWhiteSpace(dto.ReleaseTxHash))
            return BadRequest("ReleaseTxHash is required after on-chain settlement.");

        if (dto.ProviderAmountEth != expectedProviderAmountEth ||
            dto.ClientRefundAmountEth != expectedClientRefundAmountEth)
        {
            return BadRequest("Settlement amounts do not match backend rules.");
        }

        var providerAmountEth = dto.ProviderAmountEth;
        var clientRefundAmountEth = dto.ClientRefundAmountEth;
        var txHash = dto.ReleaseTxHash.Trim();

        await using var tx = await _db.Database.BeginTransactionAsync(ct);

        var oldFragmentStatus = fragment.status;
        var oldContractStatus = contract.status;

        fragment.status = shouldSplit50_50 ? "ApprovedPartial" : "Approved";
        fragment.reviewComment = string.IsNullOrWhiteSpace(dto.ReviewComment)
            ? BuildApprovalReason(isLateForRequirement, isLateForContractEnd, tooManyAttempts, submissionCount)
            : dto.ReviewComment.Trim();
        fragment.approvedByUserId = userId.Value;
        fragment.approvedAt = DateTime.UtcNow;
        fragment.releaseTxHash = txHash;
        fragment.updatedAt = DateTime.UtcNow;

        milestone.status = shouldSplit50_50 ? "ReleasedPartial" : "Released";
        milestone.releaseTxHash = txHash;
        milestone.releasedAt = DateTime.UtcNow;
        milestone.updatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(ct);

        var remaining = await _db.b_contract_milestones
            .CountAsync(m =>
                m.fkContractId == contractId &&
                m.status != "Released" &&
                m.status != "ReleasedPartial", ct);

        contract.status = remaining == 0 ? "Completed" : "InProgress";
        contract.updatedAt = DateTime.UtcNow;

        _db.b_contract_histories.Add(new b_contract_history
        {
            fkContractId = contract.contractId,
            oldStatus = oldContractStatus,
            newStatus = contract.status,
            changedByUserId = userId.Value,
            changedAt = DateTime.UtcNow,
            note = shouldSplit50_50
                ? $"Milestone #{milestone.milestoneNo} approved with partial payout/refund. Provider={providerAmountEth.ToString(CultureInfo.InvariantCulture)} ETH, ClientRefund={clientRefundAmountEth.ToString(CultureInfo.InvariantCulture)} ETH."
                : $"Milestone #{milestone.milestoneNo} approved with full payout."
        });

        _db.b_completed_list_fragment_histories.Add(new b_completed_list_fragment_history
        {
            fkContractId = contract.contractId,
            milestoneIndex = milestone.milestoneNo,
            oldStatus = oldFragmentStatus,
            newStatus = fragment.status,
            changedByUserId = userId.Value,
            changedAt = DateTime.UtcNow,
            note = BuildApprovalReason(isLateForRequirement, isLateForContractEnd, tooManyAttempts, submissionCount),
            delayInDays = CalculateDelayInDays(fragment.submittedAt, requirementDeadline),
            isFinalState = true
        });

        _db.b_notifications.Add(new b_notification
        {
            fkUserId = contract.fkProviderUserId,
            title = shouldSplit50_50 ? "Partial payout processed" : "Fragment approved",
            message = shouldSplit50_50
                ? $"Fragment approved with partial payout for contract #{contract.contractId}."
                : $"Fragment approved and payout released for contract #{contract.contractId}.",
            type = shouldSplit50_50 ? "contract_fragment_partial_release" : "contract_fragment_release",
            referenceId = contract.contractId,
            isRead = false,
            createdAt = DateTime.UtcNow
        });

        if (contract.status == "Completed")
        {
            await _valuationService.EnsureRatingRowExistsAsync(contract.contractId, ct);
            await _valuationService.RecalculateSystemRatingAsync(contract.contractId, ct);
        }

        await _db.SaveChangesAsync(ct);
        await tx.CommitAsync(ct);

        return Ok(new
        {
            message = "Fragment approved successfully.",
            contractStatus = contract.status,
            fragmentStatus = fragment.status,
            milestoneStatus = milestone.status,
            payout = new
            {
                fullAmountEth = expectedFullAmount,
                providerAmountEth,
                clientRefundAmountEth,
                wasPartial = shouldSplit50_50,
                submissionCount,
                isLateForRequirement,
                isLateForContractEnd,
                tooManyAttempts,
                txHash
            }
        });
    }

    // ---------------------------
    // GET settlement preview before on-chain payout
    // GET api/inquiries/contracts/{contractId}/fragments/{fragmentId}/settlement-preview
    // ---------------------------
    [Authorize]
    [HttpGet("contracts/{contractId:int}/fragments/{fragmentId:int}/settlement-preview")]
    public async Task<IActionResult> GetSettlementPreview(int contractId, int fragmentId, CancellationToken ct)
    {
        var userId = GetUserIdFromJwt();
        if (userId == null) return Unauthorized();

        var contract = await _db.b_contracts
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.contractId == contractId, ct);

        if (contract == null) return NotFound("Contract not found.");
        if (contract.fkClientUserId != userId.Value) return Forbid();

        var fragment = await _db.b_completed_listing_fragments
            .AsNoTracking()
            .FirstOrDefaultAsync(f => f.fragmentId == fragmentId && f.fkContractId == contractId, ct);

        if (fragment == null) return NotFound("Fragment not found.");

        if (!string.Equals(fragment.status, "Submitted", StringComparison.OrdinalIgnoreCase))
            return BadRequest("Only submitted fragments can be settled.");

        var milestone = await _db.b_contract_milestones
            .AsNoTracking()
            .FirstOrDefaultAsync(m => m.milestoneId == fragment.fkMilestoneId && m.fkContractId == contractId, ct);

        if (milestone == null) return NotFound("Milestone not found.");

        var requirementDeadline = await GetMilestoneDeadline(milestone.fkRequirementId, ct);
        var contractDeadline = await GetContractDeadline(contract.fkInquiryId, ct);

        var submissionCount = await _db.b_completed_listing_fragments
            .CountAsync(f => f.fkContractId == contractId && f.fkMilestoneId == milestone.milestoneId, ct);

        var isLastMilestone = await IsLastMilestone(contractId, milestone.milestoneNo, ct);

        var isLateForRequirement = requirementDeadline.HasValue && fragment.submittedAt.Date > requirementDeadline.Value.Date;
        var isLateForContractEnd = isLastMilestone && contractDeadline.HasValue && fragment.submittedAt.Date > contractDeadline.Value.Date;
        var tooManyAttempts = submissionCount > 3;

        var shouldSplit50_50 = isLateForRequirement || isLateForContractEnd || tooManyAttempts;

        var fullAmountEth = milestone.amountEth ?? 0m;
        var providerAmountEth = shouldSplit50_50
            ? Math.Round(fullAmountEth / 2m, 8, MidpointRounding.AwayFromZero)
            : fullAmountEth;

        var clientRefundAmountEth = Math.Round(fullAmountEth - providerAmountEth, 8, MidpointRounding.AwayFromZero);

        return Ok(new
        {
            contractId,
            fragmentId,
            milestoneId = milestone.milestoneId,
            milestoneNo = milestone.milestoneNo,
            milestoneIndex = milestone.milestoneNo - 1,
            fullAmountEth,
            providerAmountEth,
            clientRefundAmountEth,
            wasPartial = shouldSplit50_50,
            submissionCount,
            isLateForRequirement,
            isLateForContractEnd,
            tooManyAttempts,
            reason = BuildApprovalReason(isLateForRequirement, isLateForContractEnd, tooManyAttempts, submissionCount)
        });
    }

    // ---------------------------
    // GET contract fragments
    // GET api/inquiries/contracts/{contractId}/fragments
    // ---------------------------
    [Authorize]
    [HttpGet("contracts/{contractId:int}/fragments")]
    public async Task<IActionResult> GetContractFragments(int contractId, CancellationToken ct)
    {
        var userId = GetUserIdFromJwt();
        if (userId == null) return Unauthorized();

        var contract = await _db.b_contracts
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.contractId == contractId, ct);

        if (contract == null) return NotFound("Contract not found.");

        var isClient = contract.fkClientUserId == userId.Value;
        var isProvider = contract.fkProviderUserId == userId.Value;

        if (!isClient && !isProvider) return Forbid();

        var fragments = await _db.b_completed_listing_fragments
            .AsNoTracking()
            .Where(f => f.fkContractId == contractId)
            .OrderBy(f => f.fkMilestoneId)
            .ThenByDescending(f => f.submittedAt)
            .Select(f => new
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
            })
            .ToListAsync(ct);

        return Ok(new
        {
            contractId,
            currentUserId = userId.Value,
            isClient,
            isProvider,
            fragments
        });
    }

    // ---------------------------
    // helpers
    // ---------------------------
    private int? GetUserIdFromJwt()
        {
            var s =
                User.FindFirstValue("userId") ??
                User.FindFirstValue(ClaimTypes.NameIdentifier) ??
                User.FindFirstValue("sub");

            return int.TryParse(s, out var id) ? id : null;
        }

        private async Task ApplyUpdate(b_inquiry inquiry, InquiryUpdateDTO dto, string modifiedBy, CancellationToken ct)
        {
            await using var tx = await _db.Database.BeginTransactionAsync(ct);

            inquiry.description = dto.Description.Trim();
            inquiry.proposedSum = dto.ProposedSum;

            inquiry.lastModifiedBy = modifiedBy;
            if (modifiedBy == "OWNER")
            {
                inquiry.senderSeen = false;
                inquiry.ownerSeen = true;
            }
            else
            {
                inquiry.ownerSeen = false;
                inquiry.senderSeen = true;
            }

            // optional fields if exist in entity:
            // inquiry.IsModified = true;
             inquiry.modifiedAt = DateTime.UtcNow;
            // inquiry.ModifiedNote = string.IsNullOrWhiteSpace(dto.ModifiedNote) ? null : dto.ModifiedNote.Trim();

            var existingReqs = await _db.b_requirements
                .Where(r => r.fk_inquiryId == inquiry.inquiryId)
                .ToListAsync(ct);

            var keepIds = new HashSet<int>();

            foreach (var r in dto.Requirements)
            {
                if (string.IsNullOrWhiteSpace(r.Description)) continue;

                b_requirement entity;

                if (r.RequirementId.HasValue)
                {
                    entity = existingReqs.FirstOrDefault(x => x.requirementId == r.RequirementId.Value);
                    if (entity == null) continue;
                    keepIds.Add(entity.requirementId);
                }
                else
                {
                    entity = new b_requirement { fk_inquiryId = inquiry.inquiryId };
                    _db.b_requirements.Add(entity);
                }

                entity.description = r.Description.Trim();
                entity.forseenCompletionDate = r.ForseenCompletionDate.HasValue
                    ? DateOnly.FromDateTime(r.ForseenCompletionDate.Value)
                    : null;

                if (r.File != null && r.File.Length > 0)
                {
                    var url = await _files.SaveRequirementFileAsync(r.File, ct);
                    entity.fileUrl = url;
                }
                else if (!string.IsNullOrWhiteSpace(r.ExistingFileUrl))
                {
                    entity.fileUrl = r.ExistingFileUrl.Trim();
                }
            }

            // remove requirements that are not sent anymore (only if client uses ids)
            if (dto.Requirements.Any(x => x.RequirementId.HasValue))
            {
                foreach (var old in existingReqs)
                {
                    if (!keepIds.Contains(old.requirementId))
                        _db.b_requirements.Remove(old);
                }
            }

            await _db.SaveChangesAsync(ct);
            await tx.CommitAsync(ct);
        }

        private async Task<InquiryDetailsDTO> BuildDetails(int inquiryId, CancellationToken ct)
        {
            var inquiry = await _db.b_inquiries.AsNoTracking().FirstAsync(i => i.inquiryId == inquiryId, ct);

            var listingTitle = await _db.b_listings
                .AsNoTracking()
                .Where(l => l.listingId == inquiry.fk_listingId)
                .Select(l => l.Title)
                .FirstOrDefaultAsync(ct) ?? "Untitled listing";

            var reqs = await _db.b_requirements
                .AsNoTracking()
                .Where(r => r.fk_inquiryId == inquiry.inquiryId)
                .OrderBy(r => r.requirementId)
                .Select(r => new RequirementDetailsDTO
                {
                    RequirementId = r.requirementId,
                    Description = r.description,
                    FileUrl = r.fileUrl,
                    ForseenCompletionDate = r.forseenCompletionDate.HasValue
                        ? r.forseenCompletionDate.Value.ToString("yyyy-MM-dd")
                        : null
                })
                .ToListAsync(ct);

            return new InquiryDetailsDTO
            {
                InquiryId = inquiry.inquiryId,
                FkListingId = inquiry.fk_listingId,
                ListingTitle = listingTitle,
                FkUserId = inquiry.fk_userId,

                ProposedSum = inquiry.proposedSum,
                Description = inquiry.description,
                CreationDate = inquiry.creationDate,
                IsConfirmed = inquiry.isConfirmed,

                LastModifiedBy = inquiry.lastModifiedBy,
                OwnerSeen = inquiry.ownerSeen,
                SenderSeen = inquiry.senderSeen,

                // Status = inquiry.Status,
                // ModifiedNote = inquiry.ModifiedNote,
                 ModifiedAt = inquiry.modifiedAt,

                Requirements = reqs
            };
        }

    private async Task<DateTime?> GetMilestoneDeadline(int? requirementId, CancellationToken ct)
    {
        if (!requirementId.HasValue) return null;

        var requirement = await _db.b_requirements
            .AsNoTracking()
            .FirstOrDefaultAsync(r => r.requirementId == requirementId.Value, ct);

        if (requirement?.forseenCompletionDate == null) return null;

        return requirement.forseenCompletionDate.Value.ToDateTime(TimeOnly.MinValue);
    }

    private async Task<DateTime?> GetContractDeadline(int inquiryId, CancellationToken ct)
    {
        var latestRequirementDate = await _db.b_requirements
            .AsNoTracking()
            .Where(r => r.fk_inquiryId == inquiryId && r.forseenCompletionDate != null)
            .MaxAsync(r => (DateOnly?)r.forseenCompletionDate, ct);

        return latestRequirementDate?.ToDateTime(TimeOnly.MinValue);
    }

    private async Task<bool> IsLastMilestone(int contractId, int milestoneNo, CancellationToken ct)
    {
        var maxMilestoneNo = await _db.b_contract_milestones
            .AsNoTracking()
            .Where(m => m.fkContractId == contractId)
            .MaxAsync(m => (int?)m.milestoneNo, ct);

        return maxMilestoneNo.HasValue && milestoneNo == maxMilestoneNo.Value;
    }

    private static int CalculateDelayInDays(DateTime submittedAt, DateTime? deadline)
    {
        if (!deadline.HasValue) return 0;
        if (submittedAt.Date <= deadline.Value.Date) return 0;
        return (submittedAt.Date - deadline.Value.Date).Days;
    }

    private static string BuildApprovalReason(
        bool isLateForRequirement,
        bool isLateForContractEnd,
        bool tooManyAttempts,
        int submissionCount)
    {
        var reasons = new List<string>();

        if (isLateForRequirement)
            reasons.Add("fragment was submitted after milestone deadline");

        if (isLateForContractEnd)
            reasons.Add("last fragment was submitted after contract deadline");

        if (tooManyAttempts)
            reasons.Add($"submission count exceeded limit ({submissionCount} > 3)");

        if (reasons.Count == 0)
            return "Approved with full payout.";

        return "Approved with partial payout because " + string.Join("; ", reasons) + ".";
    }

    //private async Task EnsureRatingRowExists(int contractId, CancellationToken ct)
    //{
    //    var exists = await _db.b_ratings
    //        .AnyAsync(r => r.fkContractId == contractId, ct);

    //    if (exists) return;

    //    var contract = await _db.b_contracts
    //        .AsNoTracking()
    //        .FirstOrDefaultAsync(c => c.contractId == contractId, ct);

    //    if (contract == null) return;

    //    var inquiry = await _db.b_inquiries
    //        .AsNoTracking()
    //        .FirstOrDefaultAsync(i => i.inquiryId == contract.fkInquiryId, ct);

    //    if (inquiry == null) return;

    //    _db.b_ratings.Add(new b_rating
    //    {
    //        fkContractId = contract.contractId,
    //        fkListingId = inquiry.fk_listingId,
    //        fkFromUserId = contract.fkClientUserId,
    //        fkToUserId = contract.fkProviderUserId,
    //        userRating = null,
    //        userRatingComment = null,
    //        systemRating = null,
    //        systemRatingReason = null,
    //        createdAt = DateTime.UtcNow,
    //        updatedAt = DateTime.UtcNow
    //    });
    //}
}