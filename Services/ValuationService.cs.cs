using System.Globalization;
using BlokuGrandiniuSistema.Models;
using Microsoft.EntityFrameworkCore;

namespace BlokuGrandiniuSistema.Services
{
    public class ValuationService : IValuationService
    {
        private readonly AppDbContext _db;

        public ValuationService(AppDbContext db)
        {
            _db = db;
        }

        public async Task<b_rating> EnsureRatingRowExistsAsync(int contractId, CancellationToken ct)
        {
            var existing = await _db.b_ratings
                .FirstOrDefaultAsync(r => r.fkContractId == contractId, ct);

            if (existing != null) return existing;

            var contract = await _db.b_contracts
                .AsNoTracking()
                .FirstAsync(c => c.contractId == contractId, ct);

            var inquiry = await _db.b_inquiries
                .AsNoTracking()
                .FirstAsync(i => i.inquiryId == contract.fkInquiryId, ct);

            var created = new b_rating
            {
                fkContractId = contract.contractId,
                fkListingId = inquiry.fk_listingId,
                fkFromUserId = contract.fkClientUserId,
                fkToUserId = contract.fkProviderUserId,
                userRating = null,
                userRatingComment = null,
                systemRating = null,
                systemRatingReason = null,
                createdAt = DateTime.UtcNow,
                updatedAt = DateTime.UtcNow
            };

            _db.b_ratings.Add(created);
            await _db.SaveChangesAsync(ct);
            return created;
        }

        public async Task<b_rating> GetRatingByContractIdAsync(int contractId, CancellationToken ct)
        {
            var rating = await EnsureRatingRowExistsAsync(contractId, ct);
            return rating;
        }

        public async Task<SystemRatingCalculationResultDto> RecalculateSystemRatingAsync(int contractId, CancellationToken ct)
        {
            var contract = await _db.b_contracts
                .FirstOrDefaultAsync(c => c.contractId == contractId, ct);

            if (contract == null)
                throw new InvalidOperationException("Contract not found.");

            if (!string.Equals(contract.status, "Completed", StringComparison.OrdinalIgnoreCase) &&
                !string.Equals(contract.status, "Closed", StringComparison.OrdinalIgnoreCase))
            {
                throw new InvalidOperationException("System rating can only be calculated when contract is Completed or Closed.");
            }

            var rating = await EnsureRatingRowExistsAsync(contractId, ct);
            var calc = await CalculateSystemRatingInternalAsync(contract, ct);

            rating.systemRating = calc.FinalRating;
            rating.systemRatingReason = calc.ReasonText;
            rating.updatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync(ct);

            return calc;
        }

        public async Task<ContractMetricsDto> CalculateContractMetricsAsync(int contractId, CancellationToken ct)
        {
            var contract = await _db.b_contracts
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.contractId == contractId, ct);

            if (contract == null)
                throw new InvalidOperationException("Contract not found.");

            return await CalculateContractMetricsInternalAsync(contract, ct);
        }

        public async Task<b_rating> SubmitUserRatingAsync(
            int contractId,
            int currentUserId,
            int userRating,
            string? userRatingComment,
            CancellationToken ct)
        {
            if (userRating < 0 || userRating > 5)
                throw new InvalidOperationException("UserRating must be between 0 and 5.");

            var contract = await _db.b_contracts
                .FirstOrDefaultAsync(c => c.contractId == contractId, ct);

            if (contract == null)
                throw new InvalidOperationException("Contract not found.");

            if (contract.fkClientUserId != currentUserId)
                throw new InvalidOperationException("Only client can submit user rating.");

            if (!string.Equals(contract.status, "Completed", StringComparison.OrdinalIgnoreCase) &&
                !string.Equals(contract.status, "Closed", StringComparison.OrdinalIgnoreCase))
            {
                throw new InvalidOperationException("User rating can only be submitted when contract is Completed or Closed.");
            }

            await using var tx = await _db.Database.BeginTransactionAsync(ct);

            var rating = await EnsureRatingRowExistsAsync(contractId, ct);

            if (rating.systemRating == null)
            {
                var calc = await CalculateSystemRatingInternalAsync(contract, ct);
                rating.systemRating = calc.FinalRating;
                rating.systemRatingReason = calc.ReasonText;
            }

            rating.userRating = userRating;
            rating.userRatingComment = string.IsNullOrWhiteSpace(userRatingComment)
                ? null
                : userRatingComment.Trim();
            rating.updatedAt = DateTime.UtcNow;

            if (!string.Equals(contract.status, "Closed", StringComparison.OrdinalIgnoreCase))
            {
                var oldStatus = contract.status;
                contract.status = "Closed";
                contract.updatedAt = DateTime.UtcNow;

                _db.b_contract_histories.Add(new b_contract_history
                {
                    fkContractId = contract.contractId,
                    oldStatus = oldStatus,
                    newStatus = "Closed",
                    changedByUserId = currentUserId,
                    changedAt = DateTime.UtcNow,
                    note = "Client submitted final user rating."
                });
            }

            await _db.SaveChangesAsync(ct);
            await tx.CommitAsync(ct);

            return rating;
        }

        private async Task<SystemRatingCalculationResultDto> CalculateSystemRatingInternalAsync(
            b_contract contract,
            CancellationToken ct)
        {
            var metrics = await CalculateContractMetricsInternalAsync(contract, ct);
            var terms = await _db.b_inquiry_contract_terms
                .AsNoTracking()
                .FirstOrDefaultAsync(t => t.fkInquiryId == contract.fkInquiryId, ct);

            var rejectedFragmentsScore = EvaluateRejectedFragmentsThreshold(
                metrics.RejectedFragmentsCount,
                terms?.rejectedFragmentsMaxCount ?? 0);

            const decimal maxPoints = 10m;

            var totalPoints =
                metrics.FragmentSpeedScore +
                metrics.RevisionCountScore +
                metrics.ContractSpeedScore +
                metrics.MessageResponseScore +
                rejectedFragmentsScore.Score;

            var finalRating = Math.Round((totalPoints / maxPoints) * 5m, 2, MidpointRounding.AwayFromZero);

            var reason = string.Join(Environment.NewLine, new[]
            {
                $"Fragment speed: {metrics.FragmentSpeedScore.ToString(CultureInfo.InvariantCulture)}/2 - {metrics.FragmentSpeedReason}",
                $"Revision count: {metrics.RevisionCountScore.ToString(CultureInfo.InvariantCulture)}/2 - {metrics.RevisionCountReason}",
                $"Contract speed: {metrics.ContractSpeedScore.ToString(CultureInfo.InvariantCulture)}/2 - {metrics.ContractSpeedReason}",
                $"Message response: {metrics.MessageResponseScore.ToString(CultureInfo.InvariantCulture)}/2 - {metrics.MessageResponseReason}",
                $"Rejected fragments: {rejectedFragmentsScore.Score.ToString(CultureInfo.InvariantCulture)}/2 - {rejectedFragmentsScore.Reason}",
                $"Total: {totalPoints.ToString(CultureInfo.InvariantCulture)}/10",
                $"Final system rating: {finalRating.ToString("0.00", CultureInfo.InvariantCulture)}/5.00"
            });

            return new SystemRatingCalculationResultDto
            {
                FinalRating = finalRating,
                ReasonText = reason,
                Breakdown = new
                {
                    fragmentSpeed = metrics.FragmentSpeedScore,
                    revisionCount = metrics.RevisionCountScore,
                    revisionCountAverage = metrics.RevisionCountAverage,
                    contractSpeed = metrics.ContractSpeedScore,
                    messageResponse = metrics.MessageResponseScore,
                    rejectedFragments = metrics.RejectedFragmentsScore,
                    thresholdScores = new
                    {
                        fragmentSpeed = metrics.FragmentSpeedScore,
                        revisionCount = metrics.RevisionCountScore,
                        contractSpeed = metrics.ContractSpeedScore,
                        messageResponse = metrics.MessageResponseScore,
                        rejectedFragments = rejectedFragmentsScore.Score
                    },
                    totalPoints
                }
            };
        }

        private async Task<ContractMetricsDto> CalculateContractMetricsInternalAsync(
            b_contract contract,
            CancellationToken ct)
        {
            var milestones = await _db.b_contract_milestones
                .AsNoTracking()
                .Where(m => m.fkContractId == contract.contractId)
                .OrderBy(m => m.milestoneNo)
                .ToListAsync(ct);

            var requirements = await _db.b_requirements
                .AsNoTracking()
                .Where(r => r.fk_inquiryId == contract.fkInquiryId)
                .OrderBy(r => r.requirementId)
                .ToListAsync(ct);

            var fragments = await _db.b_completed_listing_fragments
                .AsNoTracking()
                .Where(f => f.fkContractId == contract.contractId)
                .OrderBy(f => f.submittedAt)
                .ToListAsync(ct);

            var fragmentHistory = await _db.b_completed_list_fragment_histories
                .AsNoTracking()
                .Where(h => h.fkContractId == contract.contractId)
                .OrderBy(h => h.changedAt)
                .ToListAsync(ct);

            var messages = await _db.b_contract_messages
                .AsNoTracking()
                .Where(m => m.fkContractId == contract.contractId)
                .OrderBy(m => m.sentAt)
                .ToListAsync(ct);

            var fragmentSpeedScore = CalculateFragmentSpeedScore(contract, milestones, requirements, fragments);
            var terms = await _db.b_inquiry_contract_terms
                .AsNoTracking()
                .FirstOrDefaultAsync(t => t.fkInquiryId == contract.fkInquiryId, ct);

            var revisionScore = CalculateRevisionScore(milestones, fragments, terms?.revisionCountMaxAverage ?? 3.00m);
            var contractSpeedScore = CalculateContractSpeedScore(contract, requirements, milestones);
            var messageResponseScore = CalculateMessageResponseScore(contract, messages);
            var rejectedFragmentsScore = CalculateRejectedFragmentsScore(fragments);

            return new ContractMetricsDto
            {
                FragmentSpeedScore = fragmentSpeedScore.Score,
                RevisionCountScore = revisionScore.Score,
                RevisionCountAverage = revisionScore.RawValue,
                ContractSpeedScore = contractSpeedScore.Score,
                MessageResponseScore = messageResponseScore.Score,
                RejectedFragmentsScore = rejectedFragmentsScore.Score,
                RejectedFragmentsCount = CountRejectedFragments(fragments),
                FragmentSpeedReason = fragmentSpeedScore.Reason,
                RevisionCountReason = revisionScore.Reason,
                ContractSpeedReason = contractSpeedScore.Reason,
                MessageResponseReason = messageResponseScore.Reason,
                RejectedFragmentsReason = rejectedFragmentsScore.Reason
            };
        }

        private ScorePart CalculateFragmentSpeedScore(
            b_contract contract,
            List<b_contract_milestone> milestones,
            List<b_requirement> requirements,
            List<b_completed_listing_fragment> fragments)
        {
            var requirementById = requirements.ToDictionary(r => r.requirementId, r => r);
            var fragmentScores = new List<decimal>();

            foreach (var fragment in fragments)
            {
                var milestone = milestones.FirstOrDefault(m => m.milestoneId == fragment.fkMilestoneId);
                DateTime? deadline = null;

                if (milestone?.fkRequirementId.HasValue == true &&
                    requirementById.TryGetValue(milestone.fkRequirementId.Value, out var req) &&
                    req.forseenCompletionDate.HasValue)
                {
                    deadline = req.forseenCompletionDate.Value.ToDateTime(TimeOnly.MinValue);
                }

                if (!deadline.HasValue)
                {
                    fragmentScores.Add(0m);
                    continue;
                }

                fragmentScores.Add(fragment.submittedAt <= deadline.Value ? 2m : 0m);
            }

            var timelyCount = fragmentScores.Count(s => s == 2m);
            var lateCount = fragmentScores.Count(s => s == 0m);
            var sum = fragmentScores.Sum();
            var avg = fragmentScores.Count == 0 ? 0m : Math.Round(sum / fragmentScores.Count, 2, MidpointRounding.AwayFromZero);
            return new ScorePart
            {
                Score = avg,
                Reason = $"On-time fragments get 2 points, late fragments get 0. Formula: {sum.ToString("0.##", CultureInfo.InvariantCulture)} point(s) / {fragmentScores.Count} fragment(s) = {avg.ToString("0.##", CultureInfo.InvariantCulture)}. On time: {timelyCount}; late: {lateCount}."
            };
        }

        private ScorePart CalculateRevisionScore(
            List<b_contract_milestone> milestones,
            List<b_completed_listing_fragment> fragments,
            decimal fragmentResubmissionNumber)
        {
            var actualRevisionCount = CountRejectedFragments(fragments);
            var maxRevisions = fragmentResubmissionNumber * milestones.Count;
            var excellentLimit = Math.Round(maxRevisions * 0.25m, 0, MidpointRounding.AwayFromZero);
            var acceptableLimit = Math.Round(maxRevisions * 0.75m, 0, MidpointRounding.AwayFromZero);

            decimal score;
            if (actualRevisionCount <= excellentLimit) score = 2m;
            else if (actualRevisionCount <= acceptableLimit) score = 1m;
            else score = 0m;

            return new ScorePart
            {
                Score = score,
                RawValue = actualRevisionCount,
                Reason = $"Total revisions across the whole contract: {actualRevisionCount}. Max revisions = fragment resubmission number {fragmentResubmissionNumber.ToString("0.##", CultureInfo.InvariantCulture)} * {milestones.Count} milestone(s) = {maxRevisions.ToString("0.##", CultureInfo.InvariantCulture)}. 25% limit rounded: {excellentLimit.ToString("0", CultureInfo.InvariantCulture)}; 75% limit rounded: {acceptableLimit.ToString("0", CultureInfo.InvariantCulture)}."
            };
        }

        private ScorePart CalculateContractSpeedScore(
            b_contract contract,
            List<b_requirement> requirements,
            List<b_contract_milestone> milestones)
        {
            var lastDeadline = requirements
                .Where(r => r.forseenCompletionDate.HasValue)
                .Select(r => (DateTime?)r.forseenCompletionDate!.Value.ToDateTime(TimeOnly.MinValue))
                .Max();

            var completedAt = milestones
                .Where(m => m.releasedAt.HasValue)
                .Select(m => (DateTime?)m.releasedAt)
                .Max();

            if (!lastDeadline.HasValue || !completedAt.HasValue)
            {
                return new ScorePart
                {
                    Score = 0m,
                    Reason = "Contract deadline or completion date is missing."
                };
            }

            decimal score;
            if (completedAt.Value <= lastDeadline.Value) score = 2m;
            else if (completedAt.Value <= lastDeadline.Value.AddDays(2)) score = 1m;
            else score = 0m;

            return new ScorePart
            {
                Score = score,
                Reason = $"Contract completed at {completedAt.Value:yyyy-MM-dd HH:mm:ss}, deadline was {lastDeadline.Value:yyyy-MM-dd HH:mm:ss}. On or before deadline = 2; up to 2 days late = 1; more than 2 days late = 0."
            };
        }

        private ScorePart CalculateMessageResponseScore(
            b_contract contract,
            List<b_contract_message> messages)
        {
            var clientMessages = messages
                .Where(m => m.fkSenderUserId == contract.fkClientUserId)
                .OrderBy(m => m.sentAt)
                .ToList();

            var responseHours = new List<double>();

            foreach (var clientMsg in clientMessages)
            {
                var reply = messages
                    .Where(m =>
                        m.fkSenderUserId == contract.fkProviderUserId &&
                        m.sentAt > clientMsg.sentAt)
                    .OrderBy(m => m.sentAt)
                    .FirstOrDefault();

                if (reply != null)
                {
                    responseHours.Add((reply.sentAt - clientMsg.sentAt).TotalHours);
                }
            }

            if (responseHours.Count == 0)
            {
                return new ScorePart
                {
                    Score = 2m,
                    Reason = "No client-provider response pairs required a provider reply."
                };
            }

            var avgHours = responseHours.Average();

            decimal score;
            if (avgHours <= 18) score = 2m;
            else if (avgHours <= 24) score = 1m;
            else score = 0m;

            return new ScorePart
            {
                Score = score,
                Reason = $"Average provider response time is {avgHours.ToString("0.##", CultureInfo.InvariantCulture)} hour(s). Up to 18 hours = 2; up to 24 hours = 1; over 24 hours = 0."
            };
        }

        private ScorePart CalculateRejectedFragmentsScore(
            List<b_completed_listing_fragment> fragments)
        {
            var rejectedCount = CountRejectedFragments(fragments);

            decimal score;
            if (rejectedCount <= 1) score = 2m;
            else if (rejectedCount <= 3) score = 1m;
            else score = 0m;

            return new ScorePart
            {
                Score = score,
                Reason = $"Rejected fragment count is {rejectedCount}."
            };
        }

        private static int CountRejectedFragments(List<b_completed_listing_fragment> fragments)
        {
            return fragments.Count(f =>
                string.Equals(f.status, "Rejected", StringComparison.OrdinalIgnoreCase));
        }

        private static ScorePart EvaluateRejectedFragmentsThreshold(int actualCount, int maxCount)
        {
            if (maxCount <= 0)
            {
                return new ScorePart
                {
                    Score = actualCount == 0 ? 2m : 0m,
                    Reason = $"Rejected fragment count is {actualCount}. Agreed allowed count is {maxCount}. With zero allowed rejects: 0 rejected = 2; any rejected fragments = 0."
                };
            }

            decimal score;
            if (actualCount < maxCount) score = 2m;
            else if (actualCount == maxCount) score = 1m;
            else score = 0m;

            return new ScorePart
            {
                Score = score,
                Reason = $"Rejected fragment count is {actualCount}. Agreed allowed count is {maxCount}. Less than allowed = 2; exactly allowed = 1; more than allowed = 0."
            };
        }

        private sealed class ScorePart
        {
            public decimal Score { get; set; }
            public decimal RawValue { get; set; }
            public string Reason { get; set; } = "";
        }
    }
}
