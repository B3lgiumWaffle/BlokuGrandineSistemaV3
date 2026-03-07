using System;
using System.Collections.Generic;

namespace BlokuGrandiniuSistema.Models;

public partial class b_contract_milestone
{
    public int milestoneId { get; set; }

    public int fkContractId { get; set; }

    public int? fkRequirementId { get; set; }

    public int milestoneNo { get; set; }

    public decimal? amountEth { get; set; }

    public decimal amountEurSnapshot { get; set; }

    public string status { get; set; } = null!;

    public string? releaseTxHash { get; set; }

    public DateTime? releasedAt { get; set; }

    public DateTime createdAt { get; set; }

    public DateTime updatedAt { get; set; }

    public virtual ICollection<b_completed_listing_fragment> b_completed_listing_fragments { get; set; } = new List<b_completed_listing_fragment>();

    public virtual b_contract fkContract { get; set; } = null!;

    public virtual b_requirement? fkRequirement { get; set; }
}
