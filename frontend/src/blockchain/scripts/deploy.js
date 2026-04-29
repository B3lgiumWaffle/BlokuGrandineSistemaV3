import { network } from "hardhat";

async function main() {
    const { ethers } = await network.connect("localhost");

    const Escrow = await ethers.getContractFactory("ServiceEscrow");
    const escrow = await Escrow.deploy();

    await escrow.waitForDeployment();

    console.log("ServiceEscrow deployed to:", await escrow.getAddress());
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});