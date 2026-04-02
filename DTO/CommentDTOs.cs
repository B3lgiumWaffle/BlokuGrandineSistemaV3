namespace BlokuGrandiniuSistema.DTOs;

public class CompletedContractCommentListItemDTO
{
    public int ContractId { get; set; }
    public int ListingId { get; set; }
    public string ListingTitle { get; set; } = "";
    public string OtherPartyName { get; set; } = "";
    public string MyRole { get; set; } = "";
    public string Status { get; set; } = "";
    public bool HasComment { get; set; }
    public string? CommentText { get; set; }
    public DateTime? CommentCreatedAt { get; set; }
    public DateTime? ContractCreatedAt { get; set; }
}

public class ContractCommentDetailsDTO
{
    public int ContractId { get; set; }
    public int ListingId { get; set; }
    public string ListingTitle { get; set; } = "";
    public string OtherPartyName { get; set; } = "";
    public string MyRole { get; set; } = "";
    public string Status { get; set; } = "";
    public bool HasComment { get; set; }
    public string? CommentText { get; set; }
    public DateTime? CommentCreatedAt { get; set; }
}

public class CreateCommentDTO
{
    public string CommentText { get; set; } = "";
}