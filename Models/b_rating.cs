using System;
using System.Collections.Generic;

namespace BlokuGrandiniuSistema.Models;

public partial class b_rating
{
    public int ratingId { get; set; }

    public int fkContractId { get; set; }

    public int fkListingId { get; set; }

    public int fkFromUserId { get; set; }

    public int fkToUserId { get; set; }

    public int? userRating { get; set; }

    public string? userRatingComment { get; set; }

    public decimal? systemRating { get; set; }

    public string? systemRatingReason { get; set; }

    public DateTime createdAt { get; set; }

    public DateTime updatedAt { get; set; }

    public virtual b_contract fkContract { get; set; } = null!;

    public virtual b_user fkFromUser { get; set; } = null!;

    public virtual b_listing fkListing { get; set; } = null!;

    public virtual b_user fkToUser { get; set; } = null!;
}
