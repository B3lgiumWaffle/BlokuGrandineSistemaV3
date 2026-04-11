using System;
using System.Collections.Generic;

namespace BlokuGrandiniuSistema.Models;

public partial class b_inquiry_contract_term
{
    public int inquiryContractTermsId { get; set; }

    public int fkInquiryId { get; set; }

    public decimal fragmentSpeedMinScore { get; set; }

    public decimal fragmentSpeedRefundPercent { get; set; }

    public decimal revisionCountMaxAverage { get; set; }

    public decimal revisionCountRefundPercent { get; set; }

    public decimal contractSpeedMinScore { get; set; }

    public decimal contractSpeedRefundPercent { get; set; }

    public decimal messageResponseMinScore { get; set; }

    public decimal messageResponseRefundPercent { get; set; }

    public int rejectedFragmentsMaxCount { get; set; }

    public decimal rejectedFragmentsRefundPercent { get; set; }

    public DateTime createdAt { get; set; }

    public DateTime updatedAt { get; set; }

    public virtual b_inquiry fkInquiry { get; set; } = null!;
}
