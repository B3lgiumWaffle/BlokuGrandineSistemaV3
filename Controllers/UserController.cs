using BlokuGrandiniuSistema.DTOs;
using BlokuGrandiniuSistema.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using BlokuGrandiniuSistema.DTO;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Text;

namespace B.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly IConfiguration _configuration;

        public UsersController(AppDbContext db, IConfiguration configuration)
        {
            _db = db;
            _configuration = configuration;
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
                .Include(x => x.Role)
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
                RoleName = u.Role?.RoleName,
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

            var u = await _db.b_users
                .Include(x => x.Role)
                .FirstOrDefaultAsync(x => x.UserId == userId);
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

            var requestedRoleName = dto.RoleName?.Trim();
            var currentRoleName = u.Role?.RoleName ?? "";

            if (!string.IsNullOrWhiteSpace(requestedRoleName) &&
                !string.Equals(requestedRoleName, currentRoleName, StringComparison.OrdinalIgnoreCase))
            {
                if (!IsSelfServiceRole(requestedRoleName))
                    return BadRequest("Only User and Seller roles can be selected.");

                if (!IsSelfServiceRole(currentRoleName))
                    return BadRequest("Your current role cannot be changed from profile settings.");

                if (string.Equals(currentRoleName, "Seller", StringComparison.OrdinalIgnoreCase) &&
                    string.Equals(requestedRoleName, "User", StringComparison.OrdinalIgnoreCase))
                {
                    var roleChangeError = await ValidateProviderCanDowngradeToUser(userId);
                    if (roleChangeError != null)
                        return BadRequest(roleChangeError);
                }

                var targetRole = await _db.b_roles.FirstOrDefaultAsync(r => r.RoleName == requestedRoleName);
                if (targetRole == null)
                    return BadRequest("Selected role does not exist.");

                u.RoleId = targetRole.RoleId;
                u.Role = targetRole;
            }

            await _db.SaveChangesAsync();

            var refreshedUser = await _db.b_users
                .Include(x => x.Role)
                .AsNoTracking()
                .FirstAsync(x => x.UserId == userId);

            var refreshedToken = BuildJwtToken(refreshedUser);

            return Ok(new
            {
                message = "Profile updated successfully.",
                token = refreshedToken,
                user = new
                {
                    userId = refreshedUser.UserId,
                    username = refreshedUser.Username,
                    email = refreshedUser.Email,
                    role = refreshedUser.Role?.RoleName
                }
            });
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

        private async Task<string?> ValidateProviderCanDowngradeToUser(int userId)
        {
            var providerContracts = await _db.b_contracts
                .AsNoTracking()
                .Where(c => c.fkProviderUserId == userId)
                .Select(c => new
                {
                    c.contractId,
                    c.status
                })
                .ToListAsync();

            var hasNonFinalStatuses = providerContracts.Any(c =>
                !string.Equals(c.status, "Closed", StringComparison.OrdinalIgnoreCase) &&
                !string.Equals(c.status, "Cancelled", StringComparison.OrdinalIgnoreCase) &&
                !string.Equals(c.status, "Canceled", StringComparison.OrdinalIgnoreCase));

            if (hasNonFinalStatuses)
                return "You can switch to User only when all provider contracts are Closed or Cancelled.";

            var closedContractIds = providerContracts
                .Where(c => string.Equals(c.status, "Closed", StringComparison.OrdinalIgnoreCase))
                .Select(c => c.contractId)
                .ToList();

            if (closedContractIds.Count > 0)
            {
                var ratedClosedContracts = await _db.b_ratings
                    .AsNoTracking()
                    .Where(r => closedContractIds.Contains(r.fkContractId) && r.userRating.HasValue)
                    .Select(r => r.fkContractId)
                    .ToListAsync();

                if (ratedClosedContracts.Count != closedContractIds.Count)
                    return "You can switch to User only when all completed provider contracts have been rated.";
            }

            var listingCount = await _db.b_listings
                .AsNoTracking()
                .CountAsync(l => l.userId == userId);

            if (listingCount > 0)
                return "You can switch to User only after deleting all your listings.";

            return null;
        }

        private static bool IsSelfServiceRole(string? roleName)
        {
            return string.Equals(roleName, "User", StringComparison.OrdinalIgnoreCase) ||
                   string.Equals(roleName, "Seller", StringComparison.OrdinalIgnoreCase);
        }

        private string BuildJwtToken(b_user user)
        {
            var jwt = _configuration.GetSection("Jwt");
            var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt["Key"]!));
            var creds = new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.UserId.ToString()),
                new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim("username", user.Username),
                new Claim(ClaimTypes.Role, user.Role?.RoleName ?? "User")
            };

            var token = new JwtSecurityToken(
                issuer: jwt["Issuer"],
                audience: jwt["Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(int.Parse(jwt["ExpiresMinutes"]!)),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
