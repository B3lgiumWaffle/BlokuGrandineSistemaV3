using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BlokuGrandiniuSistema.Models;
using System.Security.Claims;

namespace BlokuGrandiniuSistema.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BrowseListingsController : ControllerBase
{
    private readonly AppDbContext _db;
    public BrowseListingsController(AppDbContext db) => _db = db;

    private bool TryGetUserId(out int userId)
    {
        userId = 0;
        var claim = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
        return claim != null && int.TryParse(claim.Value, out userId);
    }

    // ---------------------------------------
    // BROWSE (visi prisijungę mato visus)
    // ---------------------------------------

    // GET /api/browselistings
    // grąžina visus listingus su primary + iki 3 thumbs (kaip Fiverr preview)
    [HttpGet]
    [Authorize]
    public async Task<IActionResult> GetAll()
    {
        if (!TryGetUserId(out _)) return Unauthorized();

        var baseUrl = $"{Request.Scheme}://{Request.Host}";

        var listings = await _db.b_listings
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

                photoUrls = _db.b_listing_photos
                    .Where(p => p.listingId == l.listingId)
                    .OrderByDescending(p => p.IsPrimary)
                    .ThenByDescending(p => p.UploadTime)
                    .Select(p => p.PhotoUrl)
                    .ToList()
            })
            .ToListAsync();

        var result = listings.Select(l =>
        {
            var urls = (l.photoUrls ?? new List<string>())
                .Where(u => !string.IsNullOrWhiteSpace(u))
                .Select(u => u.StartsWith("http", StringComparison.OrdinalIgnoreCase) ? u : $"{baseUrl}{u}")
                .ToList();

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
                l.isActivated,

                primaryPhotoUrl = urls.FirstOrDefault(),
                thumbPhotoUrls = urls.Skip(1).Take(3).ToList()
            };
        });

        return Ok(result);
    }

    [HttpGet("{id:int}")]
    [Authorize]
    public async Task<IActionResult> GetById(int id)
    {
        if (!TryGetUserId(out _)) return Unauthorized();

        var listing = await _db.b_listings
            .AsNoTracking()
            .Where(l => l.listingId == id && l.isActivated == 1)
            .Select(l => new
            {
                listingId = l.listingId,
                categoryId = l.CategoryId,
                title = l.Title,
                description = l.Description,
                priceFrom = l.PriceFrom,
                priceTo = l.PriceTo,
                completionTime = l.CompletionTime,
                uploadTime = l.UploadTime,
                ownerUserId = l.userId,
                isActivated = l.isActivated
            })
            .FirstOrDefaultAsync();

        if (listing == null) return NotFound();
        return Ok(listing);
    }

    [HttpGet("{listingId:int}/photos")]
    [Authorize]
    public async Task<IActionResult> GetPhotos(int listingId)
    {
        if (!TryGetUserId(out _)) return Unauthorized();

        var listingOk = await _db.b_listings
            .AsNoTracking()
            .AnyAsync(l => l.listingId == listingId && l.isActivated == 1);

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
}