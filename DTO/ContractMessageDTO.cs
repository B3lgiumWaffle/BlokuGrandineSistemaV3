namespace BlokuGrandiniuSistema.DTOs;

public class ContractMessageDTO
{
    public int MessageId { get; set; }
    public int ContractId { get; set; }
    public int SenderUserId { get; set; }
    public int ReceiverUserId { get; set; }
    public string MessageText { get; set; } = string.Empty;
    public DateTime SentAt { get; set; }
    public bool IsRead { get; set; }
    public DateTime? ReadAt { get; set; }

    public string SenderName { get; set; } = string.Empty;
    public string ReceiverName { get; set; } = string.Empty;
}