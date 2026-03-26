using System;
using System.Collections.Generic;

namespace BlokuGrandiniuSistema.Models;

public partial class b_listing
{
    public int listingId { get; set; }

    public int userId { get; set; }

    public string Title { get; set; } = null!;

    public decimal? PriceFrom { get; set; }

    public decimal? PriceTo { get; set; }

    public string? Description { get; set; }

    public string? CompletionTime { get; set; }

    public DateTime UploadTime { get; set; }

    public int CategoryId { get; set; }

    public ulong isActivated { get; set; }

    public string? adminComment { get; set; }

    public DateTime? reviewedAt { get; set; }

    public int? fkReviewedByUserId { get; set; }

    public virtual ICollection<b_inquiry> b_inquiries { get; set; } = new List<b_inquiry>();

    public virtual ICollection<b_listing_photo> b_listing_photos { get; set; } = new List<b_listing_photo>();

    public virtual b_user user { get; set; } = null!;
}
