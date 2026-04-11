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

            var fragmentSpeedScore = EvaluateThreshold(
                metrics.FragmentSpeedScore,
                terms?.fragmentSpeedMinScore ?? 2.00m,
                isAtLeast: true,
                "Fragment speed");
            var revisionScore = EvaluateThreshold(
                metrics.RevisionCountAverage,
                terms?.revisionCountMaxAverage ?? 3.00m,
                isAtLeast: false,
                "Revision count");
            var contractSpeedScore = EvaluateThreshold(
                metrics.ContractSpeedScore,
                terms?.contractSpeedMinScore ?? 2.00m,
                isAtLeast: true,
                "Contract speed");
            var messageResponseScore = EvaluateThreshold(
                metrics.MessageResponseScore,
                terms?.messageResponseMinScore ?? 2.00m,
                isAtLeast: true,
                "Message response");
            var rejectedFragmentsScore = EvaluateRejectedFragmentsThreshold(
                metrics.RejectedFragmentsCount,
                terms?.rejectedFragmentsMaxCount ?? 0);

            const decimal maxPoints = 10m;

            var totalPoints =
                fragmentSpeedScore.Score +
                revisionScore.Score +
                contractSpeedScore.Score +
                messageResponseScore.Score +
                rejectedFragmentsScore.Score;

            var finalRating = Math.Round((totalPoints / maxPoints) * 5m, 2, MidpointRounding.AwayFromZero);

            var reason = string.Join(Environment.NewLine, new[]
            {
                $"Fragment speed: {metrics.FragmentSpeedScore.ToString(CultureInfo.InvariantCulture)}/2 - {metrics.FragmentSpeedReason} Agreed minimum: {(terms?.fragmentSpeedMinScore ?? 2.00m).ToString(CultureInfo.InvariantCulture)}.",
                $"Revision count: {metrics.RevisionCountScore.ToString(CultureInfo.InvariantCulture)}/2 - {metrics.RevisionCountReason} Agreed maximum average rejects per milestone: {(terms?.revisionCountMaxAverage ?? 3.00m).ToString(CultureInfo.InvariantCulture)}.",
                $"Contract speed: {metrics.ContractSpeedScore.ToString(CultureInfo.InvariantCulture)}/2 - {metrics.ContractSpeedReason} Agreed minimum: {(terms?.contractSpeedMinScore ?? 2.00m).ToString(CultureInfo.InvariantCulture)}.",
                $"Message response: {metrics.MessageResponseScore.ToString(CultureInfo.InvariantCulture)}/2 - {metrics.MessageResponseReason} Agreed minimum: {(terms?.messageResponseMinScore ?? 2.00m).ToString(CultureInfo.InvariantCulture)}.",
                $"Rejected fragments: {metrics.RejectedFragmentsScore.ToString(CultureInfo.InvariantCulture)}/2 - {metrics.RejectedFragmentsReason} Agreed maximum count: {(terms?.rejectedFragmentsMaxCount ?? 0).ToString(CultureInfo.InvariantCulture)}.",
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
                        fragmentSpeed = fragmentSpeedScore.Score,
                        revisionCount = revisionScore.Score,
                        contractSpeed = contractSpeedScore.Score,
                        messageResponse = messageResponseScore.Score,
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
            var revisionScore = CalculateRevisionScore(milestones, fragmentHistory);
            var contractSpeedScore = CalculateContractSpeedScore(contract, requirements, milestones);
            var messageResponseScore = CalculateMessageResponseScore(contract, messages);
            var rejectedFragmentsScore = CalculateRejectedFragmentsScore(fragmentHistory);

            return new ContractMetricsDto
            {
                FragmentSpeedScore = fragmentSpeedScore.Score,
                RevisionCountScore = revisionScore.Score,
                RevisionCountAverage = revisionScore.RawValue,
                ContractSpeedScore = contractSpeedScore.Score,
                MessageResponseScore = messageResponseScore.Score,
                RejectedFragmentsScore = rejectedFragmentsScore.Score,
                RejectedFragmentsCount = CountRejectedFragments(fragmentHistory),
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
            var perMilestoneScores = new List<decimal>();

            DateTime currentWindowStart = contract.createdAt;

            foreach (var milestone in milestones.OrderBy(m => m.milestoneNo))
            {
                DateTime? windowEnd = null;

                if (milestone.fkRequirementId.HasValue &&
                    requirementById.TryGetValue(milestone.fkRequirementId.Value, out var req) &&
                    req.forseenCompletionDate.HasValue)
                {
                    windowEnd = req.forseenCompletionDate.Value.ToDateTime(TimeOnly.MinValue);
                }

                var finalFragment = fragments
                    .Where(f => f.fkMilestoneId == milestone.milestoneId &&
                                (f.status == "Approved" || f.status == "ApprovedPartial"))
                    .OrderByDescending(f => f.submittedAt)
                    .FirstOrDefault();

                if (finalFragment == null || !windowEnd.HasValue)
                {
                    perMilestoneScores.Add(0m);
                    continue;
                }

                var totalHours = Math.Max((windowEnd.Value - currentWindowStart).TotalHours, 1);
                var fastThreshold = currentWindowStart.AddHours(totalHours * (2d / 3d));

                decimal score;
                if (finalFragment.submittedAt <= fastThreshold) score = 2m;
                else if (finalFragment.submittedAt <= windowEnd.Value) score = 1m;
                else score = 0m;

                perMilestoneScores.Add(score);
                currentWindowStart = windowEnd.Value;
            }

            var avg = perMilestoneScores.Count == 0 ? 0m : Math.Round(perMilestoneScores.Average(), 2);
            return new ScorePart
            {
                Score = avg,
                Reason = $"Average milestone speed score is {avg.ToString("0.##", CultureInfo.InvariantCulture)} across {perMilestoneScores.Count} milestone(s)."
            };
        }

        private ScorePart CalculateRevisionScore(
            List<b_contract_milestone> milestones,
            List<b_completed_list_fragment_history> fragmentHistory)
        {
            var milestoneScores = new List<decimal>();
            var rejectCounts = new List<int>();

            foreach (var milestone in milestones)
            {
                var rejectCount = fragmentHistory.Count(h =>
                    h.milestoneIndex == milestone.milestoneNo &&
                    string.Equals(h.newStatus, "Rejected", StringComparison.OrdinalIgnoreCase));
                rejectCounts.Add(rejectCount);

                decimal score;
                if (rejectCount <= 1) score = 2m;
                else if (rejectCount == 2) score = 1m;
                else score = 0m;

                milestoneScores.Add(score);
            }

            var avg = milestoneScores.Count == 0 ? 0m : Math.Round(milestoneScores.Average(), 2);
            var avgRejectCount = rejectCounts.Count == 0 ? 0m : Math.Round(rejectCounts.Average(x => (decimal)x), 2);
            return new ScorePart
            {
                Score = avg,
                RawValue = avgRejectCount,
                Reason = $"Average rejected fragments per milestone is {avgRejectCount.ToString("0.##", CultureInfo.InvariantCulture)} across {milestoneScores.Count} milestone(s)."
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

            var totalHours = Math.Max((lastDeadline.Value - contract.createdAt).TotalHours, 1);
            var fastThreshold = contract.createdAt.AddHours(totalHours * (2d / 3d));

            decimal score;
            if (completedAt.Value <= fastThreshold) score = 2m;
            else if (completedAt.Value <= lastDeadline.Value) score = 1m;
            else score = 0m;

            return new ScorePart
            {
                Score = score,
                Reason = $"Contract completed at {completedAt.Value:yyyy-MM-dd HH:mm:ss}, deadline was {lastDeadline.Value:yyyy-MM-dd HH:mm:ss}."
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
            if (avgHours <= 12) score = 2m;
            else if (avgHours <= 18) score = 1m;
            else score = 0m;

            return new ScorePart
            {
                Score = score,
                Reason = $"Average provider response time is {avgHours.ToString("0.##", CultureInfo.InvariantCulture)} hour(s)."
            };
        }

        private ScorePart CalculateRejectedFragmentsScore(
            List<b_completed_list_fragment_history> fragmentHistory)
        {
            var rejectedCount = CountRejectedFragments(fragmentHistory);

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

        private static int CountRejectedFragments(List<b_completed_list_fragment_history> fragmentHistory)
        {
            return fragmentHistory.Count(h =>
                string.Equals(h.newStatus, "Rejected", StringComparison.OrdinalIgnoreCase));
        }

        private static ScorePart EvaluateThreshold(decimal actualValue, decimal threshold, bool isAtLeast, string label)
        {
            var passed = isAtLeast ? actualValue >= threshold : actualValue <= threshold;

            return new ScorePart
            {
                Score = passed ? 2m : 0m,
                Reason = passed
                    ? $"{label} met the agreed threshold."
                    : $"{label} did not meet the agreed threshold."
            };
        }

        private static ScorePart EvaluateRejectedFragmentsThreshold(int actualCount, int maxCount)
        {
            var passed = actualCount <= maxCount;

            return new ScorePart
            {
                Score = passed ? 2m : 0m,
                Reason = passed
                    ? "Rejected fragments stayed within the agreed threshold."
                    : "Rejected fragments exceeded the agreed threshold."
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
