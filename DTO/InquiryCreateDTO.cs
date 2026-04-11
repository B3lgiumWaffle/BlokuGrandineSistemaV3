using Microsoft.AspNetCore.Http;

namespace BlokuGrandiniuSistema.DTOs;

public class InquiryCreateDTO
{
    public int FkListingId { get; set; }
    public decimal? ProposedSum { get; set; }
    public string Description { get; set; } = "";
    public List<RequirementCreateDTO> Requirements { get; set; } = new();
    public InquiryContractTermsCreateDTO ContractTerms { get; set; } = new();
}

public class RequirementCreateDTO
{
    public string Description { get; set; } = "";
    public DateTime? ForseenCompletionDate { get; set; }
    public IFormFile? File { get; set; }
}

public class InquiryUpdateDTO
{
    public decimal? ProposedSum { get; set; }
    public string Description { get; set; } = "";
    public string? ModifiedNote { get; set; }
    public List<RequirementUpdateDTO> Requirements { get; set; } = new();
    public InquiryContractTermsCreateDTO ContractTerms { get; set; } = new();
}

public class RequirementUpdateDTO
{
    public int? RequirementId { get; set; }              // null => new
    public string Description { get; set; } = "";
    public DateTime? ForseenCompletionDate { get; set; } // convert to DateOnly in entity
    public string? ExistingFileUrl { get; set; }
    public IFormFile? File { get; set; }
}

public class InquiryListItemDTO
{
    public int InquiryId { get; set; }
    public int FkListingId { get; set; }
    public string ListingTitle { get; set; } = "";
    public decimal? ProposedSum { get; set; }
    public string Description { get; set; } = "";
    public DateTime? CreationDate { get; set; }
    public bool IsConfirmed { get; set; }

    public string? LastModifiedBy { get; set; } // OWNER/SENDER
    public bool? OwnerSeen { get; set; }
    public bool? SenderSeen { get; set; }

    public string? Status { get; set; } // optional if exists
}

public class InquiryDetailsDTO
{
    public int InquiryId { get; set; }
    public int FkListingId { get; set; }
    public string ListingTitle { get; set; } = "";
    public int? FkUserId { get; set; } // sender userId

    public decimal? ProposedSum { get; set; }
    public string Description { get; set; } = "";
    public DateTime? CreationDate { get; set; }
    public bool IsConfirmed { get; set; }

    public string? LastModifiedBy { get; set; }
    public bool? OwnerSeen { get; set; }
    public bool? SenderSeen { get; set; }

    public string? Status { get; set; } // optional if exists
    public string? ModifiedNote { get; set; } // optional if exists
    public DateTime? ModifiedAt { get; set; } // optional if exists

    public List<RequirementDetailsDTO> Requirements { get; set; } = new();
    public InquiryContractTermsDetailsDTO? ContractTerms { get; set; }
}

public class RequirementDetailsDTO
{
    public int RequirementId { get; set; }
    public string Description { get; set; } = "";
    public string? FileUrl { get; set; }
    public string? ForseenCompletionDate { get; set; } // keep as string for UI
}

public class InquiryContractTermsCreateDTO
{
    public decimal FragmentSpeedMinScore { get; set; } = 2.00m;
    public decimal FragmentSpeedRefundPercent { get; set; } = 0.00m;
    public decimal RevisionCountMaxAverage { get; set; } = 3.00m;
    public decimal RevisionCountRefundPercent { get; set; } = 0.00m;
    public decimal ContractSpeedMinScore { get; set; } = 2.00m;
    public decimal ContractSpeedRefundPercent { get; set; } = 0.00m;
    public decimal MessageResponseMinScore { get; set; } = 2.00m;
    public decimal MessageResponseRefundPercent { get; set; } = 0.00m;
    public int RejectedFragmentsMaxCount { get; set; } = 0;
    public decimal RejectedFragmentsRefundPercent { get; set; } = 0.00m;
}

public class InquiryContractTermsDetailsDTO
{
    public decimal FragmentSpeedMinScore { get; set; }
    public decimal FragmentSpeedRefundPercent { get; set; }
    public decimal RevisionCountMaxAverage { get; set; }
    public decimal RevisionCountRefundPercent { get; set; }
    public decimal ContractSpeedMinScore { get; set; }
    public decimal ContractSpeedRefundPercent { get; set; }
    public decimal MessageResponseMinScore { get; set; }
    public decimal MessageResponseRefundPercent { get; set; }
    public int RejectedFragmentsMaxCount { get; set; }
    public decimal RejectedFragmentsRefundPercent { get; set; }
}
