using System.ComponentModel.DataAnnotations;

namespace BlokuGrandiniuSistema.DTOs;

public class SendContractMessageDTO
{
    [Required]
    [MaxLength(5000)]
    public string MessageText { get; set; } = string.Empty;
}