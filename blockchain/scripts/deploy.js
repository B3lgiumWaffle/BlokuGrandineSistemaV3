import { ethers } from "hardhat";

async function main() {
    const escrowFactory = await ethers.getContractFactory("MilestoneEscrow");
    const escrow = await escrowFactory.deploy();

    await escrow.waitForDeployment();

    const address = await escrow.getAddress();
    console.log("MilestoneEscrow deployed to:", address);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});