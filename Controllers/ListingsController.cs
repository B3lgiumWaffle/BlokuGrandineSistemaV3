using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BlokuGrandiniuSistema.DTO;
using BlokuGrandiniuSistema.Models;


using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.AspNetCore.Authorization;


namespace BlokuGrandiniuSistema.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ListingsController : ControllerBase
{
    private readonly AppDbContext _db;
    public ListingsController(AppDbContext db) => _db = db;

    private bool TryGetUserId(out int userId)
    {
        userId = 0;
        var claim = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
        return claim != null && int.TryParse(claim.Value, out userId);
    }

    [HttpPost("addListing")]
    [Authorize]
    public async Task<IActionResult> AddListing([FromBody] CreateListingDTO req)
    {
        var claim = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
        if (claim == null) return Unauthorized();

        if (!int.TryParse(claim.Value, out int userId))
            return Unauthorized();

        // (optional) minimal validation
        if (string.IsNullOrWhiteSpace(req.Title))
            return BadRequest(new { message = "Title yra privalomas." });

        // (optional) patikrinti ar tokia kategorija egzistuoja
        var categoryExists = await _db.b_categories.AnyAsync(c => c.CategoryId == req.CategoryId);
        if (!categoryExists)
            return BadRequest(new { message = "Neteisinga kategorija." });


        var listing = new b_listing
        {
            userId = userId,
            CategoryId = req.CategoryId,
            Title = req.Title.Trim(),
            Description = req.Description,
            PriceFrom = req.PriceFrom,
            PriceTo = req.PriceTo,
            CompletionTime = req.CompletionTime,
            isActivated = 0,
            adminComment = null,
            reviewedAt = null,
            fkReviewedByUserId = null,
            UploadTime = DateTime.UtcNow
        };

        _db.b_listings.Add(listing);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = listing.listingId }, listing);
    }

    // GET /api/listings/{id}
    [HttpGet("{id:int}")]
    [Authorize]
    public async Task<IActionResult> GetById(int id)
    {
        if (!TryGetUserId(out var userId)) return Unauthorized();

        var listing = await _db.b_listings
            .AsNoTracking()
            .Where(l => l.listingId == id && l.userId == userId)
            .Select(l => new {
                listingId = l.listingId,
                categoryId = l.CategoryId,
                title = l.Title,
                description = l.Description,
                priceFrom = l.PriceFrom,
                priceTo = l.PriceTo,
                completionTime = l.CompletionTime,
                uploadTime = l.UploadTime
            })
            .FirstOrDefaultAsync();

        if (listing == null) return NotFound();
        return Ok(listing);
    }

    [HttpGet("mine")]
    [Authorize]
    public async Task<IActionResult> GetMyListings()
    {
        if (!TryGetUserId(out var userId))
            return Unauthorized();

        var baseUrl = $"{Request.Scheme}://{Request.Host}";

        var listings = await _db.b_listings
            .Where(l => l.userId == userId)
            .OrderByDescending(l => l.UploadTime)
            .Select(l => new
            {
                l.listingId,
                l.Title,
                l.PriceFrom,
                l.PriceTo,
                l.CompletionTime,
                l.UploadTime,
                l.CategoryId,

                
                primaryPhotoUrl = _db.b_listing_photos
                    .Where(p => p.listingId == l.listingId && p.IsPrimary)
                    .Select(p => p.PhotoUrl)
                    .FirstOrDefault()
            })
            .ToListAsync();

        // pridėti pilną URL
        var result = listings.Select(l => new
        {
            l.listingId,
            l.Title,
            l.PriceFrom,
            l.PriceTo,
            l.CompletionTime,
            l.UploadTime,
            l.CategoryId,
            primaryPhotoUrl = string.IsNullOrWhiteSpace(l.primaryPhotoUrl)
                ? null
                : $"{baseUrl}{l.primaryPhotoUrl}"
        });

        return Ok(result);
    }

    [HttpGet]
    public async Task<IActionResult> GetAllListings()
    {
        var baseUrl = $"{Request.Scheme}://{Request.Host}";

        var listings = await _db.b_listings
            .AsNoTracking()
            .Where(l => l.isActivated == 1)
            .OrderByDescending(l => l.UploadTime)
            .Join(
                _db.b_users.AsNoTracking(),
                listing => listing.userId,
                user => user.UserId,
                (listing, user) => new
                {
                    Listing = listing,
                    Owner = user
                }
            )
            .Select(l => new
            {
                listingId = l.Listing.listingId,
                title = l.Listing.Title,
                description = l.Listing.Description,
                priceFrom = l.Listing.PriceFrom,
                priceTo = l.Listing.PriceTo,
                completionTime = l.Listing.CompletionTime,
                uploadTime = l.Listing.UploadTime,
                categoryId = l.Listing.CategoryId,
                ownerUserId = l.Owner.UserId,
                ownerName = !string.IsNullOrWhiteSpace(l.Owner.Username)
                    ? l.Owner.Username
                    : ((l.Owner.firstname ?? "") + " " + (l.Owner.lastname ?? "")).Trim(),
                ownerAvatarUrl = l.Owner.avatar,

                photos = _db.b_listing_photos
                    .Where(p => p.listingId == l.Listing.listingId)
                    .OrderByDescending(p => p.IsPrimary)
                    .ThenByDescending(p => p.UploadTime)
                    .Select(p => p.PhotoUrl)
                    .ToList()
            })
            .ToListAsync();

        var result = listings.Select(l =>
        {
            var urls = (l.photos ?? new List<string>())
                .Where(u => !string.IsNullOrWhiteSpace(u))
                .Select(u => u.StartsWith("http", StringComparison.OrdinalIgnoreCase) ? u : $"{baseUrl}{u}")
                .ToList();

            var primary = urls.FirstOrDefault();
            var thumbs = urls.Skip(1).Take(3).ToList();

            return new
            {
                l.listingId,
                l.title,
                l.description,
                l.priceFrom,
                l.priceTo,
                l.completionTime,
                l.uploadTime,
                l.categoryId,
                l.ownerUserId,
                ownerName = string.IsNullOrWhiteSpace(l.ownerName) ? $"Provider #{l.ownerUserId}" : l.ownerName,
                ownerAvatarUrl = string.IsNullOrWhiteSpace(l.ownerAvatarUrl)
                    ? null
                    : (l.ownerAvatarUrl.StartsWith("http", StringComparison.OrdinalIgnoreCase)
                        ? l.ownerAvatarUrl
                        : $"{baseUrl}{l.ownerAvatarUrl}"),
                primaryPhotoUrl = primary,
                thumbPhotoUrls = thumbs
            };
        });

        return Ok(result);
    }



    // PUT /api/listings/{id}
    [HttpPut("{id:int}")]
    [Authorize]
    public async Task<IActionResult> Update(int id, [FromBody] CreateListingDTO req)
    {
        if (!TryGetUserId(out var userId)) return Unauthorized();

        var listing = await _db.b_listings
            .FirstOrDefaultAsync(l => l.listingId == id && l.userId == userId);

        if (listing == null) return NotFound();

        // optional: validacija
        if (string.IsNullOrWhiteSpace(req.Title))
            return BadRequest(new { message = "Title yra privalomas." });

        // optional: patikrinti ar category egzistuoja
        var categoryExists = await _db.b_categories.AnyAsync(c => c.CategoryId == req.CategoryId);
        if (!categoryExists)
            return BadRequest(new { message = "Neteisinga kategorija." });

        listing.Title = req.Title.Trim();
        listing.Description = req.Description;
        listing.PriceFrom = req.PriceFrom;
        listing.PriceTo = req.PriceTo;
        listing.CompletionTime = req.CompletionTime;
        listing.CategoryId = req.CategoryId;

        await _db.SaveChangesAsync();

        return Ok(new { message = "Updated", listingId = listing.listingId });
    }

    // DELETE /api/listings/{id} (optional - jei nori dabar)
    [HttpDelete("{id:int}")]
    [Authorize]
    public async Task<IActionResult> Delete(int id)
    {
        if (!TryGetUserId(out var userId)) return Unauthorized();

        var listing = await _db.b_listings
            .FirstOrDefaultAsync(l => l.listingId == id && l.userId == userId);

        if (listing == null) return NotFound();

        _db.b_listings.Remove(listing);
        await _db.SaveChangesAsync();

        return Ok(new { message = "Deleted" });
    }


    // -------------------------
    // PHOTOS
    // -------------------------

    // GET /api/listings/{listingId}/photos
    [HttpGet("{listingId:int}/photos")]
    [Authorize]
    public async Task<IActionResult> GetPhotos(int listingId)
    {
        if (!TryGetUserId(out var userId)) return Unauthorized();

        var listingOk = await _db.b_listings
            .AsNoTracking()
            .AnyAsync(l => l.listingId == listingId && l.userId == userId);

        if (!listingOk) return NotFound("Listing not found.");

        var baseUrl = $"{Request.Scheme}://{Request.Host}";

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
            .ToListAsync();

        return Ok(photos);
    }


    // POST /api/listings/{listingId}/photos
    // FormData: Files (multi) + PrimaryIndex
    [HttpPost("{listingId:int}/photos")]
    [Authorize]
    [Consumes("multipart/form-data")]
    [RequestSizeLimit(30_000_000)] // 30MB
    public async Task<IActionResult> UploadPhotos(int listingId, [FromForm] UploadListingPhotosDto dto)
    {
        if (!TryGetUserId(out var userId)) return Unauthorized();

        var listing = await _db.b_listings
            .FirstOrDefaultAsync(l => l.listingId == listingId && l.userId == userId);

        if (listing == null) return NotFound("Listing not found.");

        if (dto.Files == null || dto.Files.Count == 0)
            return BadRequest("Files are required.");

        if (dto.PrimaryIndex < 0 || dto.PrimaryIndex >= dto.Files.Count)
            dto.PrimaryIndex = 0;

        var allowed = new[] { ".jpg", ".jpeg", ".png", ".webp" };

        // Folder: wwwroot/uploads/listings/{listingId}/
        var wwwroot = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
        var folder = Path.Combine(wwwroot, "uploads", "listings", listingId.ToString());
        Directory.CreateDirectory(folder);

        // Jei įkeliam naują setą ir nurodom primary — atžymim esamą primary (tik jei bus bent viena nauja)
        var existingPrimary = await _db.b_listing_photos
            .Where(p => p.listingId == listingId && p.IsPrimary)
            .ToListAsync();

        foreach (var ep in existingPrimary)
            ep.IsPrimary = false;

        var now = DateTime.UtcNow;

        var created = new List<b_listing_photo>();

        for (int i = 0; i < dto.Files.Count; i++)
        {
            var file = dto.Files[i];
            if (file == null || file.Length == 0) continue;

            var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!allowed.Contains(ext))
                return BadRequest($"Allowed formats: jpg, jpeg, png, webp. Bad file: {file.FileName}");

            var fileName = $"p_{Guid.NewGuid():N}{ext}";
            var fullPath = Path.Combine(folder, fileName);

            await using (var stream = System.IO.File.Create(fullPath))
            {
                await file.CopyToAsync(stream);
            }

            var publicUrl = $"/uploads/listings/{listingId}/{fileName}";

            var row = new b_listing_photo
            {
                listingId = listingId,
                PhotoUrl = publicUrl,
                IsPrimary = (i == dto.PrimaryIndex),
                UploadTime = now
            };

            created.Add(row);
            _db.b_listing_photos.Add(row);
        }

        await _db.SaveChangesAsync();

        var baseUrl = $"{Request.Scheme}://{Request.Host}";

        return Ok(created.Select(p => new
        {
            photoId = p.photoId,
            listingId = p.listingId,
            isPrimary = p.IsPrimary,
            uploadTime = p.UploadTime,
            photoUrl = $"{baseUrl}{p.PhotoUrl}"
        }));
    }


    // PUT /api/listings/{listingId}/photos/{photoId}/primary
    [HttpPut("{listingId:int}/photos/{photoId:int}/primary")]
    [Authorize]
    public async Task<IActionResult> SetPrimaryPhoto(int listingId, int photoId)
    {
        if (!TryGetUserId(out var userId)) return Unauthorized();

        var listingOk = await _db.b_listings
            .AsNoTracking()
            .AnyAsync(l => l.listingId == listingId && l.userId == userId);

        if (!listingOk) return NotFound("Listing not found.");

        var photo = await _db.b_listing_photos
            .FirstOrDefaultAsync(p => p.photoId == photoId && p.listingId == listingId);

        if (photo == null) return NotFound("Photo not found.");

        // unset others
        var all = await _db.b_listing_photos
            .Where(p => p.listingId == listingId)
            .ToListAsync();

        foreach (var p in all)
            p.IsPrimary = (p.photoId == photoId);

        await _db.SaveChangesAsync();
        return NoContent();
    }


    // DELETE /api/listings/{listingId}/photos/{photoId}
    [HttpDelete("{listingId:int}/photos/{photoId:int}")]
    [Authorize]
    public async Task<IActionResult> DeletePhoto(int listingId, int photoId)
    {
        if (!TryGetUserId(out var userId)) return Unauthorized();

        var listingOk = await _db.b_listings
            .AsNoTracking()
            .AnyAsync(l => l.listingId == listingId && l.userId == userId);

        if (!listingOk) return NotFound("Listing not found.");

        var photo = await _db.b_listing_photos
            .FirstOrDefaultAsync(p => p.photoId == photoId && p.listingId == listingId);

        if (photo == null) return NotFound("Photo not found.");

        var wasPrimary = photo.IsPrimary;

        // try delete file from disk (optional)
        try
        {
            var physical = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", photo.PhotoUrl.TrimStart('/').Replace("/", Path.DirectorySeparatorChar.ToString()));
            if (System.IO.File.Exists(physical))
                System.IO.File.Delete(physical);
        }
        catch { /* ignore */ }

        _db.b_listing_photos.Remove(photo);
        await _db.SaveChangesAsync();

        // if deleted primary -> set another as primary
        if (wasPrimary)
        {
            var next = await _db.b_listing_photos
                .Where(p => p.listingId == listingId)
                .OrderByDescending(p => p.UploadTime)
                .FirstOrDefaultAsync();

            if (next != null)
            {
                next.IsPrimary = true;
                await _db.SaveChangesAsync();
            }
        }

        return NoContent();
    }





}
