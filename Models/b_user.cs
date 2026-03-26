using System;
using System.Collections.Generic;

namespace BlokuGrandiniuSistema.Models;

public partial class b_user
{
    public int UserId { get; set; }

    public string Username { get; set; } = null!;

    public string Email { get; set; } = null!;

    public string PasswordHash { get; set; } = null!;

    public int RoleId { get; set; }

    public string? avatar { get; set; }

    public string? firstname { get; set; }

    public string? lastname { get; set; }

    public string? Website { get; set; }

    public string? WalletAddress { get; set; }

    public virtual b_role Role { get; set; } = null!;

    public virtual ICollection<b_completed_listing_fragment> b_completed_listing_fragmentapprovedByUsers { get; set; } = new List<b_completed_listing_fragment>();

    public virtual ICollection<b_completed_listing_fragment> b_completed_listing_fragmentsubmittedByUsers { get; set; } = new List<b_completed_listing_fragment>();

    public virtual ICollection<b_contract_message> b_contract_messagefkReceiverUsers { get; set; } = new List<b_contract_message>();

    public virtual ICollection<b_contract_message> b_contract_messagefkSenderUsers { get; set; } = new List<b_contract_message>();

    public virtual ICollection<b_contract> b_contractfkClientUsers { get; set; } = new List<b_contract>();

    public virtual ICollection<b_contract> b_contractfkProviderUsers { get; set; } = new List<b_contract>();

    public virtual ICollection<b_inquiry> b_inquiries { get; set; } = new List<b_inquiry>();

    public virtual ICollection<b_listing> b_listings { get; set; } = new List<b_listing>();

    public virtual ICollection<b_notification> b_notifications { get; set; } = new List<b_notification>();
}
