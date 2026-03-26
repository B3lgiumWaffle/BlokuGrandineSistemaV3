using System;
using System.Collections.Generic;

namespace BlokuGrandiniuSistema.Models;

public partial class b_contract
{
    public int contractId { get; set; }

    public int fkInquiryId { get; set; }

    public int fkClientUserId { get; set; }

    public int fkProviderUserId { get; set; }

    public string? clientWalletAddress { get; set; }

    public string? providerWalletAddress { get; set; }

    public string network { get; set; } = null!;

    public string? smartContractAddress { get; set; }

    public long? chainProjectId { get; set; }

    public decimal agreedAmountEur { get; set; }

    public decimal? fundedAmountEth { get; set; }

    public int milestoneCount { get; set; }

    public decimal? milestoneAmountEth { get; set; }

    public string? fundingTxHash { get; set; }

    public string status { get; set; } = null!;

    public DateTime createdAt { get; set; }

    public DateTime updatedAt { get; set; }

    public virtual ICollection<b_completed_listing_fragment> b_completed_listing_fragments { get; set; } = new List<b_completed_listing_fragment>();

    public virtual ICollection<b_contract_message> b_contract_messages { get; set; } = new List<b_contract_message>();

    public virtual ICollection<b_contract_milestone> b_contract_milestones { get; set; } = new List<b_contract_milestone>();

    public virtual b_user fkClientUser { get; set; } = null!;

    public virtual b_inquiry fkInquiry { get; set; } = null!;

    public virtual b_user fkProviderUser { get; set; } = null!;
}
