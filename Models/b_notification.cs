using System;
using System.Collections.Generic;

namespace BlokuGrandiniuSistema.Models;

public partial class b_notification
{
    public int notificationId { get; set; }

    public int fkUserId { get; set; }

    public string title { get; set; } = null!;

    public string? message { get; set; }

    public string type { get; set; } = null!;

    public int? referenceId { get; set; }

    public bool isRead { get; set; }

    public DateTime createdAt { get; set; }

    public virtual b_user fkUser { get; set; } = null!;
}
