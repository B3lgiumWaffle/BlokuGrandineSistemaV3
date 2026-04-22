using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BlokuGrandiniuSistema.DTO;
using BlokuGrandiniuSistema.Models;

using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using System.Text;


namespace YourNamespace.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;
    public AuthController(AppDbContext db) => _db = db;

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest req)
    {
        var loginKey = (req.UsernameOrEmail ?? "").Trim();
        if (string.IsNullOrWhiteSpace(loginKey) || string.IsNullOrWhiteSpace(req.Password))
            return BadRequest(new { message = "Fill all fields." });

        var user = await _db.b_users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Username == loginKey || u.Email == loginKey);

        if (user == null)
            return Unauthorized(new { message = "Incorect data" });

        var ok = BCrypt.Net.BCrypt.Verify(req.Password, user.PasswordHash);
        if (!ok)
            return Unauthorized(new { message = "Incorect login information" });

        var jwt = HttpContext.RequestServices.GetRequiredService<IConfiguration>().GetSection("Jwt");

        var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt["Key"]!));
        var creds = new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
    {
        // patogu turėti abu
        new Claim(JwtRegisteredClaimNames.Sub, user.UserId.ToString()),
        new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),

        new Claim(JwtRegisteredClaimNames.Email, user.Email),
        new Claim("username", user.Username),
        new Claim(ClaimTypes.Role, user.Role!.RoleName)
    };

        var token = new JwtSecurityToken(
            issuer: jwt["Issuer"],
            audience: jwt["Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(int.Parse(jwt["ExpiresMinutes"]!)),
            signingCredentials: creds
        );

        var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

        return Ok(new
        {
            token = tokenString,
            user = new
            {
                userId = user.UserId,
                username = user.Username,
                email = user.Email,
                role = user.Role!.RoleName
            }
        });
    }


    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest req)
    {
        // 1) paprasta validacija
        var username = (req.Username ?? "").Trim();
        var email = (req.Email ?? "").Trim();

        if (string.IsNullOrWhiteSpace(username) ||
            string.IsNullOrWhiteSpace(email) ||
            string.IsNullOrWhiteSpace(req.Password) ||
            string.IsNullOrWhiteSpace(req.RepeatPassword))
        {
            return BadRequest(new { message = "Fill all fields." });
        }

        if (!email.Contains("@"))
            return BadRequest(new { message = "Incorect email format." });

        if (req.Password.Length < 6)
            return BadRequest(new { message = "Password needs to be atleast 6 symbols." });

        if (req.Password != req.RepeatPassword)
            return BadRequest(new { message = "Passwords do not match" });

        // 2) unikalumas (username/email)
        var exists = await _db.b_users.AnyAsync(u => u.Username == username || u.Email == email);
        if (exists)
            return Conflict(new { message = "This username is taken." });

        // 3) rolė: default "User", bet jei ateina RoleName ir ji leistina - panaudosim
        var roleName = string.IsNullOrWhiteSpace(req.RoleName) ? "User" : req.RoleName!.Trim();

        // Saugumo sumetimais gali apriboti, kad registracija negalėtų kurt Admin
        if (roleName.Equals("Admin", StringComparison.OrdinalIgnoreCase))
            roleName = "User";

        var role = await _db.b_roles.FirstOrDefaultAsync(r => r.RoleName == roleName);
        if (role == null)
            return BadRequest(new { message = "Provided role doesnt exist" });

        // 4) hashinam slaptažodį
        var hash = BCrypt.Net.BCrypt.HashPassword(req.Password);

        // 5) įrašom į DB
        var user = new b_user
        {
            Username = username,
            Email = email,
            PasswordHash = hash,
            RoleId = role.RoleId
        };

        _db.b_users.Add(user);
        await _db.SaveChangesAsync();

        return Ok(new
        {
            message = "Registration succesfull",
            userId = user.UserId,
            username = user.Username,
            email = user.Email,
            role = role.RoleName
        });
    }

    }
