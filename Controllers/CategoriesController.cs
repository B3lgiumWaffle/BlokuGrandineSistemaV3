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
    public CategoriesController(AppDbContext db) => _db = db;

    // GET: /api/categories
    // Grąžina kategorijas dropdown'ui
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
}
