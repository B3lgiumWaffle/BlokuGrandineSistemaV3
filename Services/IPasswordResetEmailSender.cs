namespace BlokuGrandiniuSistema.Services;

public interface IPasswordResetEmailSender
{
    Task SendPasswordResetEmailAsync(string toEmail, string resetLink, CancellationToken cancellationToken = default);
}
