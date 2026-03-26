using System;
using System.Collections.Generic;

namespace BlokuGrandiniuSistema.Models;

public partial class b_contract_message
{
    public int messageId { get; set; }

    public int fkContractId { get; set; }

    public int fkSenderUserId { get; set; }

    public int fkReceiverUserId { get; set; }

    public string messageText { get; set; } = null!;

    public DateTime sentAt { get; set; }

    public bool isRead { get; set; }

    public DateTime? readAt { get; set; }

    public virtual b_contract fkContract { get; set; } = null!;

    public virtual b_user fkReceiverUser { get; set; } = null!;

    public virtual b_user fkSenderUser { get; set; } = null!;
}
