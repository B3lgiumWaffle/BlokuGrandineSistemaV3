using System.Security.Claims;
using BlokuGrandiniuSistema.DTOs;
using BlokuGrandiniuSistema.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BlokuGrandiniuSistema.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ContractsController : ControllerBase
{
    private readonly AppDbContext _db;

    public ContractsController(AppDbContext db)
    {
        _db = db;
    }

    [Authorize]
    [HttpPost("from-inquiry/{inquiryId:int}")]
    public async Task<ActionResult<ContractDetailsDTO>> CreateFromInquiry(int inquiryId, CancellationToken ct)
    {
        var userId = GetUserIdFromJwt();
        if (userId == null) return Unauthorized();

        var inquiry = await _db.b_inquiries
            .FirstOrDefaultAsync(i => i.inquiryId == inquiryId, ct);

        if (inquiry == null)
            return NotFound("Inquiry not found.");

        var listing = await _db.b_listings
            .AsNoTracking()
            .FirstOrDefaultAsync(l => l.listingId == inquiry.fk_listingId, ct);

        if (listing == null)
            return NotFound("Listing not found.");

        if (!inquiry.fk_userId.HasValue)
            return BadRequest("Inquiry sender is missing.");

        var isSender = inquiry.fk_userId.Value == userId.Value;
        var isOwner = listing.userId == userId.Value;

        if (!isSender && !isOwner)
            return Forbid();

        if (!inquiry.isConfirmed)
            return BadRequest("Inquiry must be accepted before creating contract.");

        var existingContract = await _db.b_contracts
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.fkInquiryId == inquiryId, ct);

        if (existingContract != null)
        {
            return Ok(await BuildContractDetails(existingContract.contractId, ct));
        }

        var requirements = await _db.b_requirements
            .AsNoTracking()
            .Where(r => r.fk_inquiryId == inquiryId)
            .OrderBy(r => r.requirementId)
            .ToListAsync(ct);

        if (requirements.Count == 0)
            return BadRequest("Inquiry does not have any requirements.");

        if (!inquiry.proposedSum.HasValue || inquiry.proposedSum.Value <= 0)
            return BadRequest("Inquiry proposed sum must be greater than 0.");

        var agreedAmountEur = inquiry.proposedSum.Value;
        var milestoneCount = requirements.Count;

        await using var tx = await _db.Database.BeginTransactionAsync(ct);

        var contract = new b_contract
        {
            fkInquiryId = inquiry.inquiryId,
            fkClientUserId = inquiry.fk_userId.Value,
            fkProviderUserId = listing.userId,
            network = "sepolia",
            agreedAmountEur = agreedAmountEur,
            milestoneCount = milestoneCount,
            status = "PendingFunding",
            createdAt = DateTime.UtcNow,
            updatedAt = DateTime.UtcNow
        };

        _db.b_contracts.Add(contract);
        await _db.SaveChangesAsync(ct);

        decimal baseMilestoneAmount = Math.Round(agreedAmountEur / milestoneCount, 2);
        decimal distributed = 0m;

        var createdMilestones = new List<b_contract_milestone>();

        for (int i = 0; i < requirements.Count; i++)
        {
            decimal currentAmount;

            if (i == requirements.Count - 1)
                currentAmount = agreedAmountEur - distributed;
            else
                currentAmount = baseMilestoneAmount;

            distributed += currentAmount;

            var milestone = new b_contract_milestone
            {
                fkContractId = contract.contractId,
                fkRequirementId = requirements[i].requirementId,
                milestoneNo = i + 1,
                amountEurSnapshot = currentAmount,
                status = "Pending",
                createdAt = DateTime.UtcNow,
                updatedAt = DateTime.UtcNow
            };

            createdMilestones.Add(milestone);
        }

        _db.b_contract_milestones.AddRange(createdMilestones);

        inquiry.status = "ACCEPTED";
        inquiry.modifiedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(ct);

        await tx.CommitAsync(ct);

        return Ok(await BuildContractDetails(contract.contractId, ct));
    }

    [Authorize]
    [HttpGet("{contractId:int}")]
    public async Task<ActionResult<ContractDetailsDTO>> GetById(int contractId, CancellationToken ct)
    {
        var userId = GetUserIdFromJwt();
        if (userId == null) return Unauthorized();

        var contract = await _db.b_contracts
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.contractId == contractId, ct);

        if (contract == null)
            return NotFound("Contract not found.");

        if (contract.fkClientUserId != userId.Value && contract.fkProviderUserId != userId.Value)
            return Forbid();

        return Ok(await BuildContractDetails(contractId, ct));
    }

    [Authorize]
    [HttpGet("by-inquiry/{inquiryId:int}")]
    public async Task<ActionResult<ContractDetailsDTO>> GetByInquiryId(int inquiryId, CancellationToken ct)
    {
        var userId = GetUserIdFromJwt();
        if (userId == null) return Unauthorized();

        var contract = await _db.b_contracts
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.fkInquiryId == inquiryId, ct);

        if (contract == null)
            return NotFound("Contract not found.");

        if (contract.fkClientUserId != userId.Value && contract.fkProviderUserId != userId.Value)
            return Forbid();

        return Ok(await BuildContractDetails(contract.contractId, ct));
    }

    private async Task<ContractDetailsDTO> BuildContractDetails(int contractId, CancellationToken ct)
    {
        var contract = await _db.b_contracts
            .AsNoTracking()
            .FirstAsync(c => c.contractId == contractId, ct);

        var milestones = await _db.b_contract_milestones
            .AsNoTracking()
            .Where(m => m.fkContractId == contractId)
            .OrderBy(m => m.milestoneNo)
            .ToListAsync(ct);

        return new ContractDetailsDTO
        {
            ContractId = contract.contractId,
            InquiryId = contract.fkInquiryId,
            ClientUserId = contract.fkClientUserId,
            ProviderUserId = contract.fkProviderUserId,
            ClientWalletAddress = contract.clientWalletAddress,
            ProviderWalletAddress = contract.providerWalletAddress,
            Network = contract.network,
            SmartContractAddress = contract.smartContractAddress,
            ChainProjectId = contract.chainProjectId,
            AgreedAmountEur = contract.agreedAmountEur,
            FundedAmountEth = contract.fundedAmountEth,
            MilestoneCount = contract.milestoneCount,
            MilestoneAmountEth = contract.milestoneAmountEth,
            FundingTxHash = contract.fundingTxHash,
            Status = contract.status,
            Milestones = milestones.Select(m => new ContractMilestoneDTO
            {
                MilestoneId = m.milestoneId,
                MilestoneNo = m.milestoneNo,
                RequirementId = m.fkRequirementId,
                AmountEurSnapshot = m.amountEurSnapshot,
                Status = m.status
            }).ToList()
        };
    }

    private int? GetUserIdFromJwt()
    {
        var s =
            User.FindFirstValue("userId") ??
            User.FindFirstValue(ClaimTypes.NameIdentifier) ??
            User.FindFirstValue("sub");

        return int.TryParse(s, out var id) ? id : null;
    }
}