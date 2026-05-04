using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace BlokuGrandiniuSistema.Services;

public class ResendPasswordResetEmailSender : IPasswordResetEmailSender
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;

    public ResendPasswordResetEmailSender(HttpClient httpClient, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _configuration = configuration;
    }

    public async Task SendPasswordResetEmailAsync(string toEmail, string resetLink, CancellationToken cancellationToken = default)
    {
        var apiKey = Environment.GetEnvironmentVariable("RESEND_API_KEY")
            ?? _configuration["Resend:ApiKey"];

        if (string.IsNullOrWhiteSpace(apiKey))
        {
            throw new InvalidOperationException("RESEND_API_KEY is not configured.");
        }

        var from = Environment.GetEnvironmentVariable("RESEND_FROM_EMAIL")
            ?? _configuration["Resend:FromEmail"]
            ?? "onboarding@resend.dev";

        var appName = Environment.GetEnvironmentVariable("APP_NAME")
            ?? _configuration["App:Name"]
            ?? "Bloku Grandiniu Sistema";

        var payload = new
        {
            from,
            to = new[] { toEmail },
            subject = "Reset your password",
            html = BuildEmailHtml(appName, resetLink)
        };

        using var request = new HttpRequestMessage(HttpMethod.Post, "https://api.resend.com/emails");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);
        request.Content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");

        using var response = await _httpClient.SendAsync(request, cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            var body = await response.Content.ReadAsStringAsync(cancellationToken);
            throw new InvalidOperationException($"Resend email request failed: {(int)response.StatusCode} {body}");
        }
    }

    private static string BuildEmailHtml(string appName, string resetLink)
    {
        return $"""
            <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a">
                <h2 style="margin:0 0 12px">Reset your password</h2>
                <p>We received a request to reset your {HtmlEncode(appName)} account password.</p>
                <p>
                    <a href="{HtmlEncode(resetLink)}" style="display:inline-block;padding:12px 18px;background:#0f766e;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:700">
                        Create a new password
                    </a>
                </p>
                <p>This link will expire in 60 minutes. If you did not request this, you can safely ignore this email.</p>
            </div>
            """;
    }

    private static string HtmlEncode(string value)
    {
        return System.Net.WebUtility.HtmlEncode(value);
    }
}
