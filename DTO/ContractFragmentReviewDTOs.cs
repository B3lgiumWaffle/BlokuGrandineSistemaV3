namespace BlokuGrandiniuSistema.DTOs
{
    public class RejectFragmentDTO
    {
        public string? ReviewComment { get; set; }
    }

    public class ApproveFragmentDTO
    {
        public string? ReviewComment { get; set; }
        public string ReleaseTxHash { get; set; } = "";
        public decimal ProviderAmountEth { get; set; }
        public decimal ClientRefundAmountEth { get; set; }
    }

    public class AdminResolveDisputeDTO
    {
        public string? ReviewComment { get; set; }
    }
}
