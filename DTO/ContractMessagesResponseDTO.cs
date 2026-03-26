namespace BlokuGrandiniuSistema.DTOs;

public class ContractMessagesResponseDTO
{
    public int ContractId { get; set; }
    public string ContractStatus { get; set; } = string.Empty;
    public int CurrentUserId { get; set; }
    public int OtherUserId { get; set; }
    public string OtherUserName { get; set; } = string.Empty;
    public bool CanSendMessages { get; set; }
    public List<ContractMessageDTO> Messages { get; set; } = new();
}