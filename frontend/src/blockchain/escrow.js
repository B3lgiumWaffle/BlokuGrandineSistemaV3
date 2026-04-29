import { BrowserProvider, Contract, parseEther } from "ethers";
import escrowAbi from "./ServiceEscrowAbi.json";

export const ESCROW_ADDRESS =
    process.env.REACT_APP_ESCROW_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3";

const HARDHAT_RPC_URL =
    process.env.REACT_APP_HARDHAT_RPC_URL || "http://127.0.0.1:8545";

if (!ESCROW_ADDRESS) {
    throw new Error("Missing REACT_APP_ESCROW_ADDRESS in .env");
}

async function ensureLocalNetwork() {
    const chainIdHex = "0x7a69"; // 31337

    try {
        await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: chainIdHex }],
        });
    } catch (switchError) {
        if (switchError.code === 4902) {
            await window.ethereum.request({
                method: "wallet_addEthereumChain",
                params: [
                    {
                        chainId: chainIdHex,
                        chainName: "Hardhat Local",
                        nativeCurrency: {
                            name: "ETH",
                            symbol: "ETH",
                            decimals: 18,
                        },
                        rpcUrls: [HARDHAT_RPC_URL],
                    },
                ],
            });
        } else {
            throw switchError;
        }
    }
}

async function getProviderAndSigner() {
    if (!window.ethereum) {
        throw new Error("MetaMask not found");
    }

    await window.ethereum.request({ method: "eth_requestAccounts" });
    await ensureLocalNetwork();

    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const network = await provider.getNetwork();

    if (Number(network.chainId) !== 31337) {
        throw new Error(
            `Wrong network in MetaMask. Please switch to Hardhat Local (chainId 31337). Current chainId: ${network.chainId}`
        );
    }

    return { provider, signer };
}

export async function getCurrentWalletAddress() {
    const { signer } = await getProviderAndSigner();
    return await signer.getAddress();
}

export async function createOnChainProject({
    localContractId,
    clientWalletAddress,
    providerWalletAddress,
    milestones
}) {
    const { provider, signer } = await getProviderAndSigner();
    const signerAddress = await signer.getAddress();

    if (signerAddress.toLowerCase() !== providerWalletAddress.toLowerCase()) {
        throw new Error(
            `Active MetaMask wallet (${signerAddress}) is not the provider wallet (${providerWalletAddress})`
        );
    }

    const contract = new Contract(ESCROW_ADDRESS, escrowAbi, signer);

    const titles = milestones.map((m) => m.title);
    const amountsWei = milestones.map((m) => parseEther(String(m.amountEth)));

    const nextProjectId = await contract.nextProjectId();
    const projectId = Number(nextProjectId);

    const tx = await contract.createProject(
        localContractId,
        clientWalletAddress,
        providerWalletAddress,
        titles,
        amountsWei
    );

    const receipt = await tx.wait();

    return {
        txHash: receipt.hash,
        projectId
    };
}

export async function signAndFundProject({
    projectId,
    totalAmountEth,
    expectedClientWalletAddress
}) {
    const { signer } = await getProviderAndSigner();
    const contract = new Contract(ESCROW_ADDRESS, escrowAbi, signer);

    const walletAddress = await signer.getAddress();

    if (!expectedClientWalletAddress) {
        throw new Error("Client wallet address is missing in database");
    }

    if (walletAddress.toLowerCase() !== expectedClientWalletAddress.toLowerCase()) {
        throw new Error(
            `Active MetaMask wallet (${walletAddress}) is not the client wallet (${expectedClientWalletAddress})`
        );
    }

    const tx = await contract.signAndFund(projectId, {
        value: parseEther(String(totalAmountEth))
    });

    const receipt = await tx.wait();

    return {
        txHash: receipt.hash,
        walletAddress
    };
}

export async function releaseMilestoneOnChain({
    projectId,
    milestoneIndex
}) {
    const { signer } = await getProviderAndSigner();
    const contract = new Contract(ESCROW_ADDRESS, escrowAbi, signer);

    const tx = await contract.releaseMilestone(projectId, milestoneIndex);
    const receipt = await tx.wait();

    return {
        txHash: receipt.hash
    };
}

export async function settleMilestoneOnChain({
    projectId,
    milestoneIndex,
    providerAmountEth,
    clientRefundAmountEth
}) {
    const { signer } = await getProviderAndSigner();
    const contract = new Contract(ESCROW_ADDRESS, escrowAbi, signer);

    const tx = await contract.settleMilestone(
        projectId,
        milestoneIndex,
        parseEther(String(providerAmountEth)),
        parseEther(String(clientRefundAmountEth))
    );

    const receipt = await tx.wait();

    return {
        txHash: receipt.hash
    };
}
