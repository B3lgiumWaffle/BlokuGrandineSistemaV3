using System;
using System.Collections.Generic;

namespace BlokuGrandiniuSistema.Models;

public partial class b_contract_history
{
    public int historyId { get; set; }

    public int fkContractId { get; set; }

    public string? oldStatus { get; set; }

    public string newStatus { get; set; } = null!;

    public int changedByUserId { get; set; }

    public DateTime changedAt { get; set; }

    public string? note { get; set; }

    public virtual b_user changedByUser { get; set; } = null!;

    public virtual b_contract fkContract { get; set; } = null!;
}
