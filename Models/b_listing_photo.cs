using System;
using System.Collections.Generic;

namespace BlokuGrandiniuSistema.Models;

public partial class b_listing_photo
{
    public int photoId { get; set; }

    public int listingId { get; set; }

    public string PhotoUrl { get; set; } = null!;

    public bool IsPrimary { get; set; }

    public DateTime UploadTime { get; set; }

    public virtual b_listing listing { get; set; } = null!;
}
