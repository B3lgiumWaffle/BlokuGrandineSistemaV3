using System;
using System.Collections.Generic;

namespace BlokuGrandiniuSistema.Models;

public partial class b_inquiry
{
    public int inquiryId { get; set; }

    public int fk_listingId { get; set; }

    public int? fk_userId { get; set; }

    public string description { get; set; } = null!;

    public decimal? proposedSum { get; set; }

    public DateTime creationDate { get; set; }

    public bool isConfirmed { get; set; }

    public string status { get; set; } = null!;

    public bool isModified { get; set; }

    public DateTime? modifiedAt { get; set; }

    public string? modifiedNote { get; set; }

    public string lastModifiedBy { get; set; } = null!;

    public bool? ownerSeen { get; set; }

    public bool? senderSeen { get; set; }

    public virtual ICollection<b_requirement> b_requirements { get; set; } = new List<b_requirement>();

    public virtual b_listing fk_listing { get; set; } = null!;

    public virtual b_user? fk_user { get; set; }
}
