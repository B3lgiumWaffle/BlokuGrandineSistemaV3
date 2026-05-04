namespace BlokuGrandiniuSistema.DTO;

public class ForgotPasswordRequest
{
    public string Email { get; set; } = "";
}

public class ResetPasswordRequest
{
    public string Token { get; set; } = "";

    public string NewPassword { get; set; } = "";

    public string RepeatPassword { get; set; } = "";
}
