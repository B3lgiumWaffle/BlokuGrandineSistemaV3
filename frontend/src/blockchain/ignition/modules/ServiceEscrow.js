import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("ServiceEscrowModule", (m) => {
    const escrow = m.contract("ServiceEscrow");
    return { escrow };
});