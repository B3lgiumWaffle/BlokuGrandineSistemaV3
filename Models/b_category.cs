using System;
using System.Collections.Generic;

namespace BlokuGrandiniuSistema.Models;

public partial class b_category
{
    public int CategoryId { get; set; }

    public string Title { get; set; } = null!;

    public string? Description { get; set; }
}
