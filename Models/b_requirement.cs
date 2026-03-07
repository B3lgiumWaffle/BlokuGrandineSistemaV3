using System;
using System.Collections.Generic;

namespace BlokuGrandiniuSistema.Models;

public partial class b_requirement
{
    public int requirementId { get; set; }

    public int fk_inquiryId { get; set; }

    public string description { get; set; } = null!;

    public string? fileUrl { get; set; }

    public DateOnly? forseenCompletionDate { get; set; }

    public virtual ICollection<b_contract_milestone> b_contract_milestones { get; set; } = new List<b_contract_milestone>();

    public virtual b_inquiry fk_inquiry { get; set; } = null!;
}
