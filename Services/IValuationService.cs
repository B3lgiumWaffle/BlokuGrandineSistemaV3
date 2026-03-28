using BlokuGrandiniuSistema.Models;

namespace BlokuGrandiniuSistema.Services
{
    public interface IValuationService
    {
        Task<b_rating> EnsureRatingRowExistsAsync(int contractId, CancellationToken ct);
        Task<SystemRatingCalculationResultDto> RecalculateSystemRatingAsync(int contractId, CancellationToken ct);
        Task<b_rating> GetRatingByContractIdAsync(int contractId, CancellationToken ct);
        Task<b_rating> SubmitUserRatingAsync(int contractId, int currentUserId, int userRating, string? userRatingComment, CancellationToken ct);
    }

    public class SystemRatingCalculationResultDto
    {
        public decimal FinalRating { get; set; }
        public string ReasonText { get; set; } = "";
        public object Breakdown { get; set; } = new();
    }
}