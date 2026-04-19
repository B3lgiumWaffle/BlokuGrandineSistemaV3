using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BlokuGrandiniuSistema.Models;

namespace BlokuGrandiniuSistema.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoriesController : ControllerBase
{
    private readonly AppDbContext _db;
    private const string FallbackCategoryTitle = "No category";
    private const string FallbackCategoryDescription = "Used when a deleted category is reassigned.";

    public CategoriesController(AppDbContext db) => _db = db;

    [HttpGet]
    [Authorize]
    public async Task<IActionResult> GetAll()
    {
        var items = await _db.b_categories
            .AsNoTracking()
            .OrderBy(c => c.Title)
            .Select(c => new
            {
                categoryId = c.CategoryId,
                title = c.Title,
                description = c.Description
            })
            .ToListAsync();

        return Ok(items);
    }

    public class CreateCategoryDto
    {
        public string? Title { get; set; }

        public string? Description { get; set; }
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Create([FromBody] CreateCategoryDto dto, CancellationToken ct)
    {
        if (!IsAdmin()) return Forbid();

        var title = dto.Title?.Trim();
        if (string.IsNullOrWhiteSpace(title))
            return BadRequest(new { message = "Category title is required." });

        var exists = await _db.b_categories
            .AnyAsync(c => c.Title.ToLower() == title.ToLower(), ct);

        if (exists)
            return BadRequest(new { message = "Category with this title already exists." });

        var category = new b_category
        {
            Title = title,
            Description = string.IsNullOrWhiteSpace(dto.Description) ? null : dto.Description.Trim()
        };

        _db.b_categories.Add(category);
        await _db.SaveChangesAsync(ct);

        return Ok(new
        {
            categoryId = category.CategoryId,
            title = category.Title,
            description = category.Description
        });
    }

    [HttpDelete("{categoryId:int}")]
    [Authorize]
    public async Task<IActionResult> Delete(int categoryId, CancellationToken ct)
    {
        if (!IsAdmin()) return Forbid();

        var category = await _db.b_categories.FirstOrDefaultAsync(c => c.CategoryId == categoryId, ct);
        if (category == null)
            return NotFound(new { message = "Category not found." });

        var fallbackCategory = await EnsureFallbackCategoryAsync(ct);
        if (fallbackCategory.CategoryId == categoryId)
            return BadRequest(new { message = "The No category entry cannot be deleted." });

        await using var tx = await _db.Database.BeginTransactionAsync(ct);

        try
        {
            var listingsToUpdate = await _db.b_listings
                .Where(l => l.CategoryId == categoryId)
                .ToListAsync(ct);

            foreach (var listing in listingsToUpdate)
            {
                listing.CategoryId = fallbackCategory.CategoryId;
            }

            _db.b_categories.Remove(category);
            await _db.SaveChangesAsync(ct);
            await tx.CommitAsync(ct);

            return Ok(new
            {
                message = "Category deleted successfully.",
                movedListingsCount = listingsToUpdate.Count,
                fallbackCategoryId = fallbackCategory.CategoryId
            });
        }
        catch (Exception ex)
        {
            await tx.RollbackAsync(ct);
            return BadRequest(new
            {
                message = "Failed to delete category.",
                error = ex.Message
            });
        }
    }

    private async Task<b_category> EnsureFallbackCategoryAsync(CancellationToken ct)
    {
        var fallback = await _db.b_categories
            .FirstOrDefaultAsync(c => c.Title.ToLower() == FallbackCategoryTitle.ToLower(), ct);

        if (fallback != null)
            return fallback;

        fallback = new b_category
        {
            Title = FallbackCategoryTitle,
            Description = FallbackCategoryDescription
        };

        _db.b_categories.Add(fallback);
        await _db.SaveChangesAsync(ct);

        return fallback;
    }

    private bool IsAdmin()
    {
        var role =
            User.FindFirstValue(ClaimTypes.Role) ??
            User.FindFirstValue("role") ??
            User.FindFirstValue("http://schemas.microsoft.com/ws/2008/06/identity/claims/role");

        return role == "Admin";
    }
}
