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
            network = "localhost",
            agreedAmountEur = agreedAmountEur,
            milestoneCount = milestoneCount,
            milestoneAmountEth = milestoneCount > 0 ? Math.Round(agreedAmountEur / milestoneCount, 8) : null,
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
                amountEth = currentAmount, // local MVP: 1 EUR = 1 test ETH
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

    [Authorize]
    [HttpGet("{contractId:int}/blockchain-payload")]
    public async Task<ActionResult<ContractBlockchainPayloadDTO>> GetBlockchainPayload(int contractId, CancellationToken ct)
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

        var milestonesRaw = await _db.b_contract_milestones
            .Include(m => m.fkRequirement)
            .AsNoTracking()
            .Where(m => m.fkContractId == contractId)
            .OrderBy(m => m.milestoneNo)
            .ToListAsync(ct);

        var milestones = milestonesRaw.Select(m => new BlockchainMilestonePayloadDTO
        {
            MilestoneNo = m.milestoneNo,
            Title = !string.IsNullOrWhiteSpace(m.fkRequirement?.description)
                ? m.fkRequirement!.description
                : $"Milestone {m.milestoneNo}",
            AmountEth = m.amountEth ?? 0m
        }).ToList();

        var clientWalletAddress = contract.clientWalletAddress;
        var providerWalletAddress = contract.providerWalletAddress;

        if (string.IsNullOrWhiteSpace(clientWalletAddress))
        {
            clientWalletAddress = await _db.b_users
                .Where(u => u.UserId == contract.fkClientUserId)
                .Select(u => u.WalletAddress)
                .FirstOrDefaultAsync(ct);
        }

        if (string.IsNullOrWhiteSpace(providerWalletAddress))
        {
            providerWalletAddress = await _db.b_users
                .Where(u => u.UserId == contract.fkProviderUserId)
                .Select(u => u.WalletAddress)
                .FirstOrDefaultAsync(ct);
        }

        return Ok(new ContractBlockchainPayloadDTO
        {
            ContractId = contract.contractId,
            InquiryId = contract.fkInquiryId,
            ClientWalletAddress = clientWalletAddress,
            ProviderWalletAddress = providerWalletAddress,
            Milestones = milestones
        });
    }

    [Authorize]
    [HttpPost("{contractId:int}/on-chain-created")]
    public async Task<ActionResult<ContractDetailsDTO>> SaveOnChainCreated(
        int contractId,
        [FromBody] CreateOnChainProjectDTO dto,
        CancellationToken ct)
    {
        var userId = GetUserIdFromJwt();
        if (userId == null) return Unauthorized();

        var contract = await _db.b_contracts
            .FirstOrDefaultAsync(c => c.contractId == contractId, ct);

        if (contract == null)
            return NotFound("Contract not found.");

        if (contract.fkProviderUserId != userId.Value)
            return Forbid();

        contract.clientWalletAddress = dto.ClientWalletAddress;
        contract.providerWalletAddress = dto.ProviderWalletAddress;
        contract.smartContractAddress = dto.SmartContractAddress;
        contract.chainProjectId = dto.ChainProjectId;
        contract.updatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(ct);

        return Ok(await BuildContractDetails(contract.contractId, ct));
    }

    [Authorize]
    [HttpPost("{contractId:int}/funded")]
    public async Task<ActionResult<ContractDetailsDTO>> SaveFunded(
        int contractId,
        [FromBody] FundContractDTO dto,
        CancellationToken ct)
    {
        var userId = GetUserIdFromJwt();
        if (userId == null) return Unauthorized();

        var contract = await _db.b_contracts
            .FirstOrDefaultAsync(c => c.contractId == contractId, ct);

        if (contract == null)
            return NotFound("Contract not found.");

        if (contract.fkClientUserId != userId.Value)
            return Forbid();

        contract.clientWalletAddress = dto.ClientWalletAddress;
        contract.fundedAmountEth = dto.FundedAmountEth;
        contract.fundingTxHash = dto.FundingTxHash;
        contract.status = "Funded";
        contract.updatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(ct);

        return Ok(await BuildContractDetails(contract.contractId, ct));
    }

    [Authorize]
    [HttpPost("{contractId:int}/milestones/{milestoneNo:int}/released")]
    public async Task<ActionResult<ContractDetailsDTO>> SaveMilestoneReleased(
        int contractId,
        int milestoneNo,
        [FromBody] ReleaseMilestoneDTO dto,
        CancellationToken ct)
    {
        var userId = GetUserIdFromJwt();
        if (userId == null) return Unauthorized();

        var contract = await _db.b_contracts
            .FirstOrDefaultAsync(c => c.contractId == contractId, ct);

        if (contract == null)
            return NotFound("Contract not found.");

        if (contract.fkClientUserId != userId.Value)
            return Forbid();

        var milestone = await _db.b_contract_milestones
            .FirstOrDefaultAsync(m => m.fkContractId == contractId && m.milestoneNo == milestoneNo, ct);

        if (milestone == null)
            return NotFound("Milestone not found.");

        milestone.amountEth = dto.AmountEth;
        milestone.releaseTxHash = dto.ReleaseTxHash;
        milestone.releasedAt = DateTime.UtcNow;
        milestone.status = "Released";
        milestone.updatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(ct);

        var remaining = await _db.b_contract_milestones
            .CountAsync(m => m.fkContractId == contractId && m.status != "Released", ct);

        contract.status = remaining == 0 ? "Completed" : "InProgress";
        contract.updatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(ct);

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

        var clientWalletAddress = contract.clientWalletAddress;
        var providerWalletAddress = contract.providerWalletAddress;

        if (string.IsNullOrWhiteSpace(clientWalletAddress))
        {
            clientWalletAddress = await _db.b_users
                .Where(u => u.UserId == contract.fkClientUserId)
                .Select(u => u.WalletAddress)
                .FirstOrDefaultAsync(ct);
        }

        if (string.IsNullOrWhiteSpace(providerWalletAddress))
        {
            providerWalletAddress = await _db.b_users
                .Where(u => u.UserId == contract.fkProviderUserId)
                .Select(u => u.WalletAddress)
                .FirstOrDefaultAsync(ct);
        }

        return new ContractDetailsDTO
        {
            ContractId = contract.contractId,
            InquiryId = contract.fkInquiryId,
            ClientUserId = contract.fkClientUserId,
            ProviderUserId = contract.fkProviderUserId,
            ClientWalletAddress = clientWalletAddress,
            ProviderWalletAddress = providerWalletAddress,
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
                AmountEth = m.amountEth,
                Status = m.status,
                ReleaseTxHash = m.releaseTxHash,
                ReleasedAt = m.releasedAt
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