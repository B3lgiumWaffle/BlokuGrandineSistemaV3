using BlokuGrandiniuSistema.DTOs;
using BlokuGrandiniuSistema.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using BlokuGrandiniuSistema.DTO;

namespace B.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly AppDbContext _db;

        public UsersController(AppDbContext db)
        {
            _db = db;
        }

        private int GetUserId()
        {
            // pagal tavo login: JWT token'e yra userId
            var idStr = User.FindFirstValue("userId") ?? User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(idStr, out var userId))
                throw new UnauthorizedAccessException("Invalid token (userId missing).");
            return userId;
        }

        // GET: /api/users/me
        [HttpGet("me")]
        public async Task<ActionResult<UserProfileDto>> GetMe()
        {
            var userId = GetUserId();

            var u = await _db.b_users
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.UserId == userId);

            if (u == null) return NotFound("User not found.");

            string? fullAvatarUrl = null;

            if (!string.IsNullOrWhiteSpace(u.avatar))
            {
                var baseUrl = $"{Request.Scheme}://{Request.Host}";
                fullAvatarUrl = $"{baseUrl}{u.avatar}";
            }

            var dto = new UserProfileDto
            {
                UserId = u.UserId,
                Username = u.Username,
                Email = u.Email,
                FirstName = u.firstname,
                LastName = u.lastname,
                AvatarUrl = fullAvatarUrl,
                Website = u.Website,
                WalletAddress = u.WalletAddress
            };

            return Ok(dto);
        }


        // PUT: /api/users/me
        [HttpPut("me")]
        public async Task<IActionResult> UpdateMe([FromBody] UpdateUserProfileDto dto)
        {
            var userId = GetUserId();

            var u = await _db.b_users.FirstOrDefaultAsync(x => x.UserId == userId);
            if (u == null) return NotFound("User not found.");

            if (!string.IsNullOrWhiteSpace(dto.Email))
                u.Email = dto.Email.Trim();

            if (dto.FirstName != null)
                u.firstname = dto.FirstName.Trim();

            if (dto.LastName != null)
                u.lastname = dto.LastName.Trim();

            if (dto.Website != null)
                u.Website = dto.Website.Trim();

            if (dto.WalletAddress != null)
            {
                var wallet = dto.WalletAddress.Trim();

                if (!string.IsNullOrWhiteSpace(wallet))
                {
                    var isValidWallet =
                        System.Text.RegularExpressions.Regex.IsMatch(
                            wallet,
                            "^0x[a-fA-F0-9]{40}$"
                        );

                    if (!isValidWallet)
                        return BadRequest("Wallet address format is invalid.");
                }

                u.WalletAddress = wallet;
            }

            await _db.SaveChangesAsync();
            return NoContent();
        }

        // PUT: /api/users/me/password
        [HttpPut("me/password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
        {
            var userId = GetUserId();

            var u = await _db.b_users.FirstOrDefaultAsync(x => x.UserId == userId);
            if (u == null) return NotFound("User not found.");

            // TODO: tavo projekte naudoji bcrypt (kaip minėjai).
            // Čia palieku "stub" logiką:
            // 1) patikrinti current password su BCrypt.Verify
            // 2) užhashinti new password su BCrypt.HashPassword

            var ok = BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, u.PasswordHash);
            if (!ok) return BadRequest("Current password is incorrect.");

            u.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
            await _db.SaveChangesAsync();

            return NoContent();
        }

        // POST: /api/users/me/avatar
        [HttpPost("me/avatar")]
        [Authorize]
        [Consumes("multipart/form-data")]
        [RequestSizeLimit(10_000_000)] // 10MB
        public async Task<IActionResult> UploadAvatar([FromForm] UploadAvatarResultDto dto)
        {
            if (dto.File == null || dto.File.Length == 0)
                return BadRequest("File is required.");

            // paprastas validavimas
            var allowed = new[] { ".jpg", ".jpeg", ".png", ".webp" };
            var ext = Path.GetExtension(dto.File.FileName).ToLowerInvariant();
            if (!allowed.Contains(ext))
                return BadRequest("Allowed formats: jpg, jpeg, png, webp.");

            var userId = GetUserId();

            var u = await _db.b_users.FirstOrDefaultAsync(x => x.UserId == userId);
            if (u == null) return NotFound("User not found.");

            // kur saugau
            var root = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            var folder = Path.Combine(root, "uploads", "avatars");
            Directory.CreateDirectory(folder);

            // Unikalus failo vardas
            var fileName = $"u{userId}_{Guid.NewGuid():N}{ext}";
            var fullPath = Path.Combine(folder, fileName);

            // saugau
            await using (var stream = System.IO.File.Create(fullPath))
            {
                await dto.File.CopyToAsync(stream);
            }

            // URL, kurį galės kraut React
            var publicUrl = $"/uploads/avatars/{fileName}";

            
            u.avatar = publicUrl;
            await _db.SaveChangesAsync();

            return Ok(new { message = "Avatar updated", avatarUrl = publicUrl });
        }
    }
}
