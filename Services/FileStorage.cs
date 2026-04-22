using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;

namespace BlokuGrandiniuSistema.Services;

public interface IFileStorage
{
    Task<string> SaveRequirementFileAsync(IFormFile file, CancellationToken ct = default);
    Task DeletePublicFileAsync(string? publicPath, CancellationToken ct = default);
}

public class FileStorage : IFileStorage
{
    private readonly IWebHostEnvironment _env;

    public FileStorage(IWebHostEnvironment env)
    {
        _env = env;
    }

    public async Task<string> SaveRequirementFileAsync(IFormFile file, CancellationToken ct = default)
    {
        if (file == null || file.Length == 0) throw new InvalidOperationException("Empty file.");

        var webRoot = _env.WebRootPath;
        if (string.IsNullOrWhiteSpace(webRoot))
        {
            // jei netyčia WebRootPath null – fallback
            webRoot = Path.Combine(AppContext.BaseDirectory, "wwwroot");
            Directory.CreateDirectory(webRoot);
        }

        var dir = Path.Combine(webRoot, "uploads", "requirements");
        Directory.CreateDirectory(dir);

        var safeExt = Path.GetExtension(file.FileName);
        if (string.IsNullOrWhiteSpace(safeExt) || safeExt.Length > 10) safeExt = "";

        var name = $"{Guid.NewGuid():N}{safeExt}";
        var abs = Path.Combine(dir, name);

        await using var fs = new FileStream(abs, FileMode.CreateNew);
        await file.CopyToAsync(fs, ct);

        // public url (servinamas iš wwwroot)
        return $"/uploads/requirements/{name}";
    }

    public Task DeletePublicFileAsync(string? publicPath, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(publicPath)) return Task.CompletedTask;

        const string allowedPrefix = "/uploads/requirements/";
        if (!publicPath.StartsWith(allowedPrefix, StringComparison.OrdinalIgnoreCase))
            return Task.CompletedTask;

        var fileName = Path.GetFileName(publicPath);
        if (string.IsNullOrWhiteSpace(fileName)) return Task.CompletedTask;

        var webRoot = _env.WebRootPath;
        if (string.IsNullOrWhiteSpace(webRoot))
            webRoot = Path.Combine(AppContext.BaseDirectory, "wwwroot");

        var abs = Path.Combine(webRoot, "uploads", "requirements", fileName);

        try
        {
            if (File.Exists(abs))
                File.Delete(abs);
        }
        catch (IOException)
        {
        }
        catch (UnauthorizedAccessException)
        {
        }

        return Task.CompletedTask;
    }
}
