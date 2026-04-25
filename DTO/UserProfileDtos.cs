using System.ComponentModel.DataAnnotations;

namespace BlokuGrandiniuSistema.DTOs
{
    public class UserProfileDto
    {
        public int UserId { get; set; }
        public string? Username { get; set; }
        public string? RoleName { get; set; }

        public string? Email { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }

        public string? AvatarUrl { get; set; }
        public string? Website { get; set; }
        public string? WalletAddress { get; set; }
    }

    public class UpdateUserProfileDto
    {
        [EmailAddress]
        public string? Email { get; set; }

        [MaxLength(50)]
        public string? FirstName { get; set; }

        [MaxLength(50)]
        public string? LastName { get; set; }
        public string? RoleName { get; set; }
        public string? Website { get; set; }
        public string? WalletAddress { get; set; }
    }

    public class ChangePasswordDto
    {
        [Required]
        public string CurrentPassword { get; set; } = "";

        [Required]
        [MinLength(6)]
        public string NewPassword { get; set; } = "";
    }

    public class UploadAvatarResultDto
    {
        public string Message { get; set; } = "OK";
        public IFormFile File { get; set; } = default!;
    }
}
