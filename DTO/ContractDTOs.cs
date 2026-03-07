namespace BlokuGrandiniuSistema.DTOs;

public class CreateContractFromInquiryResultDTO
{
    public int ContractId { get; set; }
    public int InquiryId { get; set; }
    public int ClientUserId { get; set; }
    public int ProviderUserId { get; set; }
    public decimal AgreedAmountEur { get; set; }
    public int MilestoneCount { get; set; }
    public string Status { get; set; } = "";
    public List<ContractMilestoneDTO> Milestones { get; set; } = new();
}

public class ContractMilestoneDTO
{
    public int MilestoneId { get; set; }
    public int MilestoneNo { get; set; }
    public int? RequirementId { get; set; }
    public decimal AmountEurSnapshot { get; set; }
    public string Status { get; set; } = "";
}

public class ContractDetailsDTO
{
    public int ContractId { get; set; }
    public int InquiryId { get; set; }
    public int ClientUserId { get; set; }
    public int ProviderUserId { get; set; }

    public string? ClientWalletAddress { get; set; }
    public string? ProviderWalletAddress { get; set; }

    public string Network { get; set; } = "";
    public string? SmartContractAddress { get; set; }
    public long? ChainProjectId { get; set; }

    public decimal AgreedAmountEur { get; set; }
    public decimal? FundedAmountEth { get; set; }
    public int MilestoneCount { get; set; }
    public decimal? MilestoneAmountEth { get; set; }
    public string? FundingTxHash { get; set; }

    public string Status { get; set; } = "";
    public List<ContractMilestoneDTO> Milestones { get; set; } = new();
}