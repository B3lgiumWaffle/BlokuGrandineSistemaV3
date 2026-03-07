import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("MilestoneEscrowModule", (m) => {
    const milestoneEscrow = m.contract("MilestoneEscrow");

    return { milestoneEscrow };
});