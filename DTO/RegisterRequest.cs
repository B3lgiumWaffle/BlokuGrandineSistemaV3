namespace BlokuGrandiniuSistema.DTO
{
    public class RegisterRequest
    {
        public string Username { get; set; } = "";
        public string Email { get; set; } = "";
        public string Password { get; set; } = "";
        public string RepeatPassword { get; set; } = "";
        // optional: jei nori leisti pasirinkti rolę UI (kitaip bus "User")
        public string? RoleName { get; set; }
    }
}
