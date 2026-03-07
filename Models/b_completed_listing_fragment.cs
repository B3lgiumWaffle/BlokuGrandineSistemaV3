using System;
using System.Collections.Generic;

namespace BlokuGrandiniuSistema.Models;

public partial class b_completed_listing_fragment
{
    public int fragmentId { get; set; }

    public int fkContractId { get; set; }

    public int fkMilestoneId { get; set; }

    public int? fkRequirementId { get; set; }

    public string title { get; set; } = null!;

    public string? description { get; set; }

    public string? filePath { get; set; }

    public int submittedByUserId { get; set; }

    public DateTime submittedAt { get; set; }

    public string status { get; set; } = null!;

    public string? reviewComment { get; set; }

    public int? approvedByUserId { get; set; }

    public DateTime? approvedAt { get; set; }

    public string? releaseTxHash { get; set; }

    public DateTime createdAt { get; set; }

    public DateTime updatedAt { get; set; }

    public virtual b_user? approvedByUser { get; set; }

    public virtual b_contract fkContract { get; set; } = null!;

    public virtual b_contract_milestone fkMilestone { get; set; } = null!;

    public virtual b_user submittedByUser { get; set; } = null!;
}
