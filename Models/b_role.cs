using System;
using System.Collections.Generic;

namespace BlokuGrandiniuSistema.Models;

public partial class b_role
{
    public int RoleId { get; set; }

    public string RoleName { get; set; } = null!;

    public virtual ICollection<b_user> b_users { get; set; } = new List<b_user>();
}
