using BlokuGrandiniuSistema.Models;

namespace BlokuGrandiniuSistema.Services
{
    public interface IValuationService
    {
        Task<b_rating> EnsureRatingRowExistsAsync(int contractId, CancellationToken ct);
        Task<SystemRatingCalculationResultDto> RecalculateSystemRatingAsync(int contractId, CancellationToken ct);
        Task<b_rating> GetRatingByContractIdAsync(int contractId, CancellationToken ct);
        Task<b_rating> SubmitUserRatingAsync(int contractId, int currentUserId, int userRating, string? userRatingComment, CancellationToken ct);
        Task<ContractMetricsDto> CalculateContractMetricsAsync(int contractId, CancellationToken ct);
    }

    public class SystemRatingCalculationResultDto
    {
        public decimal FinalRating { get; set; }
        public string ReasonText { get; set; } = "";
        public object Breakdown { get; set; } = new();
    }

    public class ContractMetricsDto
    {
        public decimal FragmentSpeedScore { get; set; }
        public decimal RevisionCountScore { get; set; }
        public decimal RevisionCountAverage { get; set; }
        public decimal ContractSpeedScore { get; set; }
        public decimal MessageResponseScore { get; set; }
        public decimal RejectedFragmentsScore { get; set; }
        public int RejectedFragmentsCount { get; set; }
        public string FragmentSpeedReason { get; set; } = "";
        public string RevisionCountReason { get; set; } = "";
        public string ContractSpeedReason { get; set; } = "";
        public string MessageResponseReason { get; set; } = "";
        public string RejectedFragmentsReason { get; set; } = "";
    }
}
