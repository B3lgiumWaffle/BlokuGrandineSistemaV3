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

            var contractTermsValidationError = ValidateContractTerms(dto.ContractTerms);
            if (contractTermsValidationError != null) return BadRequest(contractTermsValidationError);

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

            _db.b_inquiry_contract_terms.Add(MapContractTerms(dto.ContractTerms, inquiry.inquiryId));

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

        var contractTermsValidationError = ValidateContractTerms(dto.ContractTerms);
        if (contractTermsValidationError != null) return BadRequest(contractTermsValidationError);

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
        if (inquiry.isConfirmed) return BadRequest("Inquiry is already accepted.");

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

            var contractTermsValidationError = ValidateContractTerms(dto.ContractTerms);
            if (contractTermsValidationError != null) return BadRequest(contractTermsValidationError);


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
            if (inquiry.isConfirmed) return BadRequest("Accepted inquiries cannot be deleted.");

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

        var isReturnedAfterAdminApproval =
            fragment.approvedByUserId.HasValue &&
            fragment.approvedByUserId.Value != contract.fkClientUserId &&
            fragment.approvedAt.HasValue;

        if (isReturnedAfterAdminApproval)
            return BadRequest("This fragment was already approved by administrator and can only be approved by client.");

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

    [Authorize]
    [HttpPost("contracts/{contractId:int}/fragments/{fragmentId:int}/ask-admin")]
    public async Task<IActionResult> AskForAdministrator(
        int contractId,
        int fragmentId,
        CancellationToken ct)
    {
        var userId = GetUserIdFromJwt();
        if (userId == null) return Unauthorized();

        var contract = await _db.b_contracts
            .FirstOrDefaultAsync(c => c.contractId == contractId, ct);

        if (contract == null) return NotFound("Contract not found.");
        if (contract.fkProviderUserId != userId.Value) return Forbid();

        var fragment = await _db.b_completed_listing_fragments
            .FirstOrDefaultAsync(f => f.fragmentId == fragmentId && f.fkContractId == contractId, ct);

        if (fragment == null) return NotFound("Fragment not found.");

        if (!string.Equals(fragment.status, "Rejected", StringComparison.OrdinalIgnoreCase))
            return BadRequest("Only rejected fragments can be escalated to administrator.");

        var milestone = await _db.b_contract_milestones
            .FirstOrDefaultAsync(m => m.milestoneId == fragment.fkMilestoneId && m.fkContractId == contractId, ct);

        if (milestone == null) return NotFound("Milestone not found.");

        await using var tx = await _db.Database.BeginTransactionAsync(ct);

        var oldStatus = fragment.status;
        fragment.status = "Disputed";
        fragment.updatedAt = DateTime.UtcNow;
        fragment.reviewComment = AppendAuditNote(
            fragment.reviewComment,
            $"Provider requested administrator review at {DateTime.UtcNow:yyyy-MM-dd HH:mm:ss} UTC.");

        _db.b_completed_list_fragment_histories.Add(new b_completed_list_fragment_history
        {
            fkContractId = contract.contractId,
            milestoneIndex = milestone.milestoneNo,
            oldStatus = oldStatus,
            newStatus = "Disputed",
            changedByUserId = userId.Value,
            changedAt = DateTime.UtcNow,
            note = "Provider requested administrator review.",
            delayInDays = CalculateDelayInDays(fragment.submittedAt, await GetMilestoneDeadline(milestone.fkRequirementId, ct)),
            isFinalState = false
        });

        var adminRoleIds = await _db.b_roles
            .Where(r => r.RoleName == "Admin")
            .Select(r => r.RoleId)
            .ToListAsync(ct);

        var adminUserIds = await _db.b_users
            .Where(u => adminRoleIds.Contains(u.RoleId))
            .Select(u => u.UserId)
            .ToListAsync(ct);

        foreach (var adminUserId in adminUserIds.Distinct())
        {
            _db.b_notifications.Add(new b_notification
            {
                fkUserId = adminUserId,
                title = "Fragment dispute requires review",
                message = $"Contract #{contract.contractId}, milestone #{milestone.milestoneNo} was escalated by provider.",
                type = "contract_fragment_disputed",
                referenceId = fragment.fragmentId,
                isRead = false,
                createdAt = DateTime.UtcNow
            });
        }

        _db.b_notifications.Add(new b_notification
        {
            fkUserId = contract.fkClientUserId,
            title = "Fragment dispute opened",
            message = $"Provider asked administrator to review contract #{contract.contractId}, milestone #{milestone.milestoneNo}.",
            type = "contract_fragment_dispute_opened",
            referenceId = contract.contractId,
            isRead = false,
            createdAt = DateTime.UtcNow
        });

        await _db.SaveChangesAsync(ct);
        await tx.CommitAsync(ct);

        return Ok(new
        {
            message = "Administrator review requested successfully.",
            fragmentStatus = fragment.status
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

        var settlement = await BuildSettlementDecision(contract, milestone, fragment, ct);

        if (dto == null || string.IsNullOrWhiteSpace(dto.ReleaseTxHash))
            return BadRequest("ReleaseTxHash is required after on-chain settlement.");

        if (dto.ProviderAmountEth != settlement.ProviderAmountEth ||
            dto.ClientRefundAmountEth != settlement.ClientRefundAmountEth)
        {
            return BadRequest("Settlement amounts do not match backend rules.");
        }

        var providerAmountEth = dto.ProviderAmountEth;
        var clientRefundAmountEth = dto.ClientRefundAmountEth;
        var txHash = dto.ReleaseTxHash.Trim();

        await using var tx = await _db.Database.BeginTransactionAsync(ct);

        var oldFragmentStatus = fragment.status;
        var oldContractStatus = contract.status;

        fragment.status = settlement.WasPartial ? "ApprovedPartial" : "Approved";
        fragment.reviewComment = string.IsNullOrWhiteSpace(dto.ReviewComment)
            ? settlement.Reason
            : dto.ReviewComment.Trim();
        fragment.approvedByUserId = userId.Value;
        fragment.approvedAt = DateTime.UtcNow;
        fragment.releaseTxHash = txHash;
        fragment.updatedAt = DateTime.UtcNow;

        milestone.status = settlement.WasPartial ? "ReleasedPartial" : "Released";
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
            note = settlement.WasPartial
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
            note = settlement.Reason,
            delayInDays = settlement.DelayInDays,
            isFinalState = true
        });

        _db.b_notifications.Add(new b_notification
        {
            fkUserId = contract.fkProviderUserId,
            title = settlement.WasPartial ? "Partial payout processed" : "Fragment approved",
            message = settlement.WasPartial
                ? $"Fragment approved with partial payout for contract #{contract.contractId}."
                : $"Fragment approved and payout released for contract #{contract.contractId}.",
            type = settlement.WasPartial ? "contract_fragment_partial_release" : "contract_fragment_release",
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
                fullAmountEth = settlement.FullAmountEth,
                providerAmountEth,
                clientRefundAmountEth,
                wasPartial = settlement.WasPartial,
                submissionCount = settlement.SubmissionCount,
                rejectedCountForMilestone = settlement.RejectedCountForMilestone,
                isLateForRequirement = settlement.IsLateForRequirement,
                isLateForContractEnd = settlement.IsLateForContractEnd,
                tooManyAttempts = settlement.TooManyAttempts,
                isLowFragmentSpeed = settlement.IsLowFragmentSpeed,
                isHighRevisionCount = settlement.IsHighRevisionCount,
                isLowContractSpeed = settlement.IsLowContractSpeed,
                isLowMessageResponse = settlement.IsLowMessageResponse,
                hasTooManyRejectedFragments = settlement.HasTooManyRejectedFragments,
                appliedRefundPercent = settlement.AppliedRefundPercent,
                txHash
            }
        });
    }

    [Authorize]
    [HttpDelete("contracts/{contractId:int}/fragments/{fragmentId:int}")]
    public async Task<IActionResult> DeleteSubmittedFragment(int contractId, int fragmentId, CancellationToken ct)
    {
        var userId = GetUserIdFromJwt();
        if (userId == null) return Unauthorized();

        var contract = await _db.b_contracts
            .FirstOrDefaultAsync(c => c.contractId == contractId, ct);

        if (contract == null) return NotFound("Contract not found.");

        var fragment = await _db.b_completed_listing_fragments
            .FirstOrDefaultAsync(f => f.fragmentId == fragmentId && f.fkContractId == contractId, ct);

        if (fragment == null) return NotFound("Fragment not found.");

        if (fragment.submittedByUserId != userId.Value) return Forbid();

        if (!string.Equals(fragment.status, "Submitted", StringComparison.OrdinalIgnoreCase) ||
            fragment.approvedByUserId.HasValue ||
            fragment.approvedAt.HasValue)
        {
            return BadRequest("Only unreviewed submitted fragments can be deleted by the uploader.");
        }

        var milestone = await _db.b_contract_milestones
            .FirstOrDefaultAsync(m => m.milestoneId == fragment.fkMilestoneId && m.fkContractId == contractId, ct);

        if (milestone == null) return NotFound("Milestone not found.");

        var filePath = fragment.filePath;

        await using var tx = await _db.Database.BeginTransactionAsync(ct);

        _db.b_completed_listing_fragments.Remove(fragment);
        await _db.SaveChangesAsync(ct);

        var remainingMilestoneFragments = await _db.b_completed_listing_fragments
            .AsNoTracking()
            .Where(f => f.fkContractId == contractId && f.fkMilestoneId == milestone.milestoneId)
            .ToListAsync(ct);

        if (remainingMilestoneFragments.Any(f =>
                string.Equals(f.status, "Rejected", StringComparison.OrdinalIgnoreCase) ||
                string.Equals(f.status, "Disputed", StringComparison.OrdinalIgnoreCase)))
        {
            milestone.status = "UnderRevision";
        }
        else
        {
            milestone.status = "Pending";
        }

        milestone.updatedAt = DateTime.UtcNow;

        var milestones = await _db.b_contract_milestones
            .Where(m => m.fkContractId == contractId)
            .ToListAsync(ct);

        contract.status = ResolveContractStatusAfterFragmentDelete(contract, milestones);
        contract.updatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(ct);
        await tx.CommitAsync(ct);

        await _files.DeletePublicFileAsync(filePath, ct);

        return Ok(new
        {
            message = "Fragment deleted successfully.",
            contractStatus = contract.status,
            milestoneStatus = milestone.status
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

        var settlement = await BuildSettlementDecision(contract, milestone, fragment, ct);

        return Ok(new
        {
            contractId,
            fragmentId,
            milestoneId = milestone.milestoneId,
            milestoneNo = milestone.milestoneNo,
            milestoneIndex = milestone.milestoneNo - 1,
            fullAmountEth = settlement.FullAmountEth,
            providerAmountEth = settlement.ProviderAmountEth,
            clientRefundAmountEth = settlement.ClientRefundAmountEth,
            wasPartial = settlement.WasPartial,
            submissionCount = settlement.SubmissionCount,
            isLateForRequirement = settlement.IsLateForRequirement,
            isLateForContractEnd = settlement.IsLateForContractEnd,
            tooManyAttempts = settlement.TooManyAttempts,
            isLowFragmentSpeed = settlement.IsLowFragmentSpeed,
            isHighRevisionCount = settlement.IsHighRevisionCount,
            isLowContractSpeed = settlement.IsLowContractSpeed,
            isLowMessageResponse = settlement.IsLowMessageResponse,
            hasTooManyRejectedFragments = settlement.HasTooManyRejectedFragments,
            appliedRefundPercent = settlement.AppliedRefundPercent,
            reason = settlement.Reason
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
                isDisputed = f.status == "Disputed",
                rejectLocked = f.status == "Submitted" &&
                               f.approvedByUserId.HasValue &&
                               f.approvedByUserId != contract.fkClientUserId,
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

    private static string ResolveContractStatusAfterFragmentDelete(
        b_contract contract,
        IEnumerable<b_contract_milestone> milestones)
    {
        var activeMilestones = milestones.ToList();

        if (activeMilestones.Any(m => string.Equals(m.status, "Submitted", StringComparison.OrdinalIgnoreCase)))
            return "WaitingForApproval";

        if (activeMilestones.Any(m => string.Equals(m.status, "UnderRevision", StringComparison.OrdinalIgnoreCase)))
            return "UnderRevision";

        var allReleased = activeMilestones.Count > 0 && activeMilestones.All(m =>
            string.Equals(m.status, "Released", StringComparison.OrdinalIgnoreCase) ||
            string.Equals(m.status, "ReleasedPartial", StringComparison.OrdinalIgnoreCase));

        if (allReleased) return "Completed";

        var anyReleased = activeMilestones.Any(m =>
            string.Equals(m.status, "Released", StringComparison.OrdinalIgnoreCase) ||
            string.Equals(m.status, "ReleasedPartial", StringComparison.OrdinalIgnoreCase));

        if (anyReleased) return "InProgress";

        if (contract.fundedAmountEth.HasValue &&
            !string.Equals(contract.status, "PendingFunding", StringComparison.OrdinalIgnoreCase))
        {
            return "Funded";
        }

        return contract.status;
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

            var existingTerms = await _db.b_inquiry_contract_terms
                .FirstOrDefaultAsync(t => t.fkInquiryId == inquiry.inquiryId, ct);

            if (existingTerms == null)
            {
                _db.b_inquiry_contract_terms.Add(MapContractTerms(dto.ContractTerms, inquiry.inquiryId));
            }
            else
            {
                existingTerms.fragmentSpeedMinScore = dto.ContractTerms.FragmentSpeedMinScore;
                existingTerms.fragmentSpeedRefundPercent = dto.ContractTerms.FragmentSpeedRefundPercent;
                existingTerms.revisionCountMaxAverage = dto.ContractTerms.RevisionCountMaxAverage;
                existingTerms.revisionCountRefundPercent = dto.ContractTerms.RevisionCountRefundPercent;
                existingTerms.contractSpeedMinScore = dto.ContractTerms.ContractSpeedMinScore;
                existingTerms.contractSpeedRefundPercent = dto.ContractTerms.ContractSpeedRefundPercent;
                existingTerms.messageResponseMinScore = dto.ContractTerms.MessageResponseMinScore;
                existingTerms.messageResponseRefundPercent = dto.ContractTerms.MessageResponseRefundPercent;
                existingTerms.rejectedFragmentsMaxCount = dto.ContractTerms.RejectedFragmentsMaxCount;
                existingTerms.rejectedFragmentsRefundPercent = dto.ContractTerms.RejectedFragmentsRefundPercent;
                existingTerms.updatedAt = DateTime.UtcNow;
            }

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
                    var existingEntity = existingReqs.FirstOrDefault(x => x.requirementId == r.RequirementId.Value);
                    if (existingEntity == null) continue;
                    entity = existingEntity;
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

            var contractTerms = await _db.b_inquiry_contract_terms
                .AsNoTracking()
                .Where(t => t.fkInquiryId == inquiry.inquiryId)
                .Select(t => new InquiryContractTermsDetailsDTO
                {
                    FragmentSpeedMinScore = t.fragmentSpeedMinScore,
                    FragmentSpeedRefundPercent = t.fragmentSpeedRefundPercent,
                    RevisionCountMaxAverage = t.revisionCountMaxAverage,
                    RevisionCountRefundPercent = t.revisionCountRefundPercent,
                    ContractSpeedMinScore = t.contractSpeedMinScore,
                    ContractSpeedRefundPercent = t.contractSpeedRefundPercent,
                    MessageResponseMinScore = t.messageResponseMinScore,
                    MessageResponseRefundPercent = t.messageResponseRefundPercent,
                    RejectedFragmentsMaxCount = t.rejectedFragmentsMaxCount,
                    RejectedFragmentsRefundPercent = t.rejectedFragmentsRefundPercent
                })
                .FirstOrDefaultAsync(ct);

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

                Requirements = reqs,
                ContractTerms = contractTerms
            };
        }

    private async Task<SettlementDecision> BuildSettlementDecision(
        b_contract contract,
        b_contract_milestone milestone,
        b_completed_listing_fragment fragment,
        CancellationToken ct)
    {
        var terms = await GetContractTerms(contract.fkInquiryId, ct);

        var requirementDeadline = await GetMilestoneDeadline(milestone.fkRequirementId, ct);
        var contractDeadline = await GetContractDeadline(contract.fkInquiryId, ct);

        var isLastMilestone = await IsLastMilestone(contract.contractId, milestone.milestoneNo, ct);
        var isLateForRequirement = requirementDeadline.HasValue && fragment.submittedAt.Date > requirementDeadline.Value.Date;
        var isLateForContractEnd = isLastMilestone && contractDeadline.HasValue && fragment.submittedAt.Date > contractDeadline.Value.Date;
        var submissionCount = await _db.b_completed_listing_fragments
            .CountAsync(f => f.fkContractId == contract.contractId && f.fkMilestoneId == milestone.milestoneId, ct);
        var rejectedCountForMilestone = await _db.b_completed_listing_fragments
            .CountAsync(h =>
                h.fkContractId == contract.contractId &&
                h.fkMilestoneId == milestone.milestoneId &&
                h.status == "Rejected", ct);

        var isHighRevisionCount = rejectedCountForMilestone > terms.revisionCountMaxAverage;
        var isLowFragmentSpeed = isLateForRequirement;
        var isLowContractSpeed = isLateForContractEnd;
        var isLowMessageResponse = false;
        var hasTooManyRejectedFragments = false;

        var appliedRefundPercent = new[]
        {
            isLowFragmentSpeed ? terms.fragmentSpeedRefundPercent : 0m,
            isHighRevisionCount ? terms.revisionCountRefundPercent : 0m,
            isLowContractSpeed ? terms.contractSpeedRefundPercent : 0m
        }.DefaultIfEmpty(0m).Max();

        appliedRefundPercent = Math.Clamp(appliedRefundPercent, 0m, 100m);

        var fullAmountEth = milestone.amountEth ?? 0m;
        var clientRefundAmountEth = Math.Round(fullAmountEth * appliedRefundPercent / 100m, 8, MidpointRounding.AwayFromZero);
        var providerAmountEth = Math.Round(fullAmountEth - clientRefundAmountEth, 8, MidpointRounding.AwayFromZero);

        return new SettlementDecision
        {
            FullAmountEth = fullAmountEth,
            ProviderAmountEth = providerAmountEth,
            ClientRefundAmountEth = clientRefundAmountEth,
            WasPartial = clientRefundAmountEth > 0m,
            AppliedRefundPercent = appliedRefundPercent,
            SubmissionCount = submissionCount,
            RejectedCountForMilestone = rejectedCountForMilestone,
            IsLateForRequirement = isLateForRequirement,
            IsLateForContractEnd = isLateForContractEnd,
            TooManyAttempts = false,
            IsLowFragmentSpeed = isLowFragmentSpeed,
            IsHighRevisionCount = isHighRevisionCount,
            IsLowContractSpeed = isLowContractSpeed,
            IsLowMessageResponse = isLowMessageResponse,
            HasTooManyRejectedFragments = hasTooManyRejectedFragments,
            DelayInDays = CalculateDelayInDays(fragment.submittedAt, requirementDeadline),
            Reason = BuildApprovalReason(
                rejectedCountForMilestone,
                isLateForRequirement,
                isLateForContractEnd,
                isLowFragmentSpeed,
                isHighRevisionCount,
                isLowContractSpeed,
                isLowMessageResponse,
                hasTooManyRejectedFragments,
                appliedRefundPercent)
        };
    }

    private async Task<b_inquiry_contract_term> GetContractTerms(int inquiryId, CancellationToken ct)
    {
        var terms = await _db.b_inquiry_contract_terms
            .AsNoTracking()
            .FirstOrDefaultAsync(t => t.fkInquiryId == inquiryId, ct);

        return terms ?? new b_inquiry_contract_term
        {
            fkInquiryId = inquiryId,
            fragmentSpeedMinScore = 2.00m,
            fragmentSpeedRefundPercent = 0.00m,
            revisionCountMaxAverage = 3.00m,
            revisionCountRefundPercent = 0.00m,
            contractSpeedMinScore = 2.00m,
            contractSpeedRefundPercent = 0.00m,
            messageResponseMinScore = 2.00m,
            messageResponseRefundPercent = 0.00m,
            rejectedFragmentsMaxCount = 0,
            rejectedFragmentsRefundPercent = 0.00m
        };
    }

    private static b_inquiry_contract_term MapContractTerms(InquiryContractTermsCreateDTO? dto, int inquiryId)
    {
        dto ??= new InquiryContractTermsCreateDTO();

        return new b_inquiry_contract_term
        {
            fkInquiryId = inquiryId,
            fragmentSpeedMinScore = dto.FragmentSpeedMinScore,
            fragmentSpeedRefundPercent = dto.FragmentSpeedRefundPercent,
            revisionCountMaxAverage = dto.RevisionCountMaxAverage,
            revisionCountRefundPercent = dto.RevisionCountRefundPercent,
            contractSpeedMinScore = dto.ContractSpeedMinScore,
            contractSpeedRefundPercent = dto.ContractSpeedRefundPercent,
            messageResponseMinScore = dto.MessageResponseMinScore,
            messageResponseRefundPercent = dto.MessageResponseRefundPercent,
            rejectedFragmentsMaxCount = dto.RejectedFragmentsMaxCount,
            rejectedFragmentsRefundPercent = dto.RejectedFragmentsRefundPercent
        };
    }

    private static string? ValidateContractTerms(InquiryContractTermsCreateDTO? dto)
    {
        if (dto == null) return "ContractTerms is required.";

        if (dto.FragmentSpeedMinScore < 0 || dto.FragmentSpeedMinScore > 2) return "FragmentSpeedMinScore must be between 0 and 2.";
        if (dto.RevisionCountMaxAverage < 0) return "RevisionCountMaxAverage must be 0 or greater.";
        if (dto.ContractSpeedMinScore < 0 || dto.ContractSpeedMinScore > 2) return "ContractSpeedMinScore must be between 0 and 2.";
        if (dto.MessageResponseMinScore < 0 || dto.MessageResponseMinScore > 2) return "MessageResponseMinScore must be between 0 and 2.";
        if (dto.RejectedFragmentsMaxCount < 0) return "RejectedFragmentsMaxCount must be 0 or greater.";

        var refundPercents = new[]
        {
            dto.FragmentSpeedRefundPercent,
            dto.RevisionCountRefundPercent,
            dto.ContractSpeedRefundPercent,
            dto.MessageResponseRefundPercent,
            dto.RejectedFragmentsRefundPercent
        };

        if (refundPercents.Any(x => x < 0 || x > 100))
            return "Refund percents must be between 0 and 100.";

        return null;
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

    private static string AppendAuditNote(string? currentText, string addition)
    {
        if (string.IsNullOrWhiteSpace(currentText))
            return addition;

        return $"{currentText.Trim()}{Environment.NewLine}{Environment.NewLine}{addition}";
    }

    private static string BuildApprovalReason(
        int rejectedCountForMilestone,
        bool isLateForRequirement,
        bool isLateForContractEnd,
        bool isLowFragmentSpeed,
        bool isHighRevisionCount,
        bool isLowContractSpeed,
        bool isLowMessageResponse,
        bool hasTooManyRejectedFragments,
        decimal appliedRefundPercent)
    {
        var reasons = new List<string>();

        if (isLateForRequirement)
            reasons.Add("fragment was submitted after milestone deadline");

        if (isLateForContractEnd)
            reasons.Add("last fragment was submitted after contract deadline");

        if (isLowFragmentSpeed)
            reasons.Add("fragment speed score was below the agreed threshold");

        if (isHighRevisionCount)
            reasons.Add($"rejected fragments for this milestone exceeded the agreed threshold ({rejectedCountForMilestone})");

        if (isLowContractSpeed)
            reasons.Add("delivery was late");

        if (isLowMessageResponse)
            reasons.Add("message response score was below the agreed threshold");

        if (hasTooManyRejectedFragments)
            reasons.Add("rejected fragments exceeded the agreed threshold");

        if (reasons.Count == 0)
            return "Approved with full payout.";

        return $"Approved with partial payout ({appliedRefundPercent.ToString("0.##", CultureInfo.InvariantCulture)}% refund) because " + string.Join("; ", reasons) + ".";
    }

    private sealed class SettlementDecision
    {
        public decimal FullAmountEth { get; set; }
        public decimal ProviderAmountEth { get; set; }
        public decimal ClientRefundAmountEth { get; set; }
        public bool WasPartial { get; set; }
        public decimal AppliedRefundPercent { get; set; }
        public int SubmissionCount { get; set; }
        public int RejectedCountForMilestone { get; set; }
        public bool IsLateForRequirement { get; set; }
        public bool IsLateForContractEnd { get; set; }
        public bool TooManyAttempts { get; set; }
        public bool IsLowFragmentSpeed { get; set; }
        public bool IsHighRevisionCount { get; set; }
        public bool IsLowContractSpeed { get; set; }
        public bool IsLowMessageResponse { get; set; }
        public bool HasTooManyRejectedFragments { get; set; }
        public int DelayInDays { get; set; }
        public string Reason { get; set; } = "";
    }
}
