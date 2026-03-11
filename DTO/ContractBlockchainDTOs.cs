namespace BlokuGrandiniuSistema.DTOs;

public class CreateOnChainProjectDTO
{
    public string ClientWalletAddress { get; set; } = "";
    public string ProviderWalletAddress { get; set; } = "";
    public string SmartContractAddress { get; set; } = "";
    public long ChainProjectId { get; set; }
}

public class FundContractDTO
{
    public string ClientWalletAddress { get; set; } = "";
    public decimal FundedAmountEth { get; set; }
    public string FundingTxHash { get; set; } = "";
}

public class ReleaseMilestoneDTO
{
    public decimal AmountEth { get; set; }
    public string ReleaseTxHash { get; set; } = "";
}

public class BlockchainMilestonePayloadDTO
{
    public int MilestoneNo { get; set; }
    public string Title { get; set; } = "";
    public decimal AmountEth { get; set; }
}

public class ContractBlockchainPayloadDTO
{
    public int ContractId { get; set; }
    public int InquiryId { get; set; }
    public string? ClientWalletAddress { get; set; }
    public string? ProviderWalletAddress { get; set; }
    public List<BlockchainMilestonePayloadDTO> Milestones { get; set; } = new();
}