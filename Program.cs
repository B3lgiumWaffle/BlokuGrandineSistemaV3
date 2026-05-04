using Microsoft.EntityFrameworkCore;
using BlokuGrandiniuSistema.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using BlokuGrandiniuSistema.Services;
using System.Text;

var builder = WebApplication.CreateBuilder(args);
LoadDotEnv(Path.Combine(builder.Environment.ContentRootPath, ".env"));
LoadDotEnv(Path.Combine(builder.Environment.ContentRootPath, ".env.local"));
LoadDotEnv(Path.Combine(builder.Environment.ContentRootPath, "frontend", ".env.local"));

// ---------- SERVICES (VISKAS PRIEŠ builder.Build()) ----------
builder.Services.AddControllers();
builder.Services.AddScoped<IFileStorage, FileStorage>();
builder.Services.AddScoped<IValuationService, ValuationService>();
builder.Services.AddHttpClient<IPasswordResetEmailSender, ResendPasswordResetEmailSender>();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// CORS (development)
builder.Services.AddCors(options =>
{
    options.AddPolicy("DevCors", policy =>
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod());
});

// DB
builder.Services.AddDbContext<AppDbContext>(options =>
{
    var cs = builder.Configuration.GetConnectionString("Default");
    options.UseMySql(cs, ServerVersion.AutoDetect(cs));
});

// JWT
var jwtSection = builder.Configuration.GetSection("Jwt");
var jwtKey = Encoding.UTF8.GetBytes(jwtSection["Key"]!);

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = jwtSection["Issuer"],

            ValidateAudience = true,
            ValidAudience = jwtSection["Audience"],

            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(jwtKey),

            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromSeconds(30)
        };
    });

// ---------- BUILD (tik čia) ----------
var app = builder.Build();

// ---------- MIDDLEWARE ----------
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    app.UseCors("DevCors");
}

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.UseStaticFiles();


app.MapControllers();

app.Run();

static void LoadDotEnv(string path)
{
    if (!File.Exists(path)) return;

    foreach (var rawLine in File.ReadAllLines(path))
    {
        var line = rawLine.Trim();
        if (line.Length == 0 || line.StartsWith("#")) continue;

        var separatorIndex = line.IndexOf('=');
        if (separatorIndex <= 0) continue;

        var key = line[..separatorIndex].Trim();
        var value = line[(separatorIndex + 1)..].Trim().Trim('"');

        if (string.IsNullOrWhiteSpace(key)) continue;
        Environment.SetEnvironmentVariable(key, value);
    }
}
