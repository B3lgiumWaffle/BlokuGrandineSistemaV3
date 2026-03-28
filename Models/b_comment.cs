using System;
using System.Collections.Generic;

namespace BlokuGrandiniuSistema.Models;

public partial class b_comment
{
    public int commentId { get; set; }

    public int fkListingId { get; set; }

    public int fkContractId { get; set; }

    public int fkUserId { get; set; }

    public string commentText { get; set; } = null!;

    public DateTime createdAt { get; set; }

    public bool? isVisible { get; set; }

    public virtual b_contract fkContract { get; set; } = null!;

    public virtual b_listing fkListing { get; set; } = null!;

    public virtual b_user fkUser { get; set; } = null!;
}
