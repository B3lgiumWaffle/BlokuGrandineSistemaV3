import dotenv from "dotenv";
import { defineConfig } from "hardhat/config";
import hardhatEthers from "@nomicfoundation/hardhat-ethers";
import hardhatIgnition from "@nomicfoundation/hardhat-ignition";

dotenv.config();

const { SEPOLIA_RPC_URL, PRIVATE_KEY } = process.env;

export default defineConfig({
    solidity: "0.8.24",
    plugins: [hardhatEthers, hardhatIgnition],
    networks: {
        sepolia: {
            type: "http",
            chainType: "l1",
            url: SEPOLIA_RPC_URL || "",
            accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
        },
    },
});