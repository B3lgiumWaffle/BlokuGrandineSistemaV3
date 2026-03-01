using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using BlokuGrandiniuSistema.DTOs;
using BlokuGrandiniuSistema.Services;
using BlokuGrandiniuSistema.Models;

namespace BlokuGrandiniuSistema.Controllers;

    [ApiController]
    [Route("api/[controller]")]
    public class InquiriesController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly IFileStorage _files;

        public InquiriesController(AppDbContext db, IFileStorage files)
        {
            _db = db;
            _files = files;
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
    }