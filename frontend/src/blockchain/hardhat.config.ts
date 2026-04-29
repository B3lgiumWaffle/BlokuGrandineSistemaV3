import { defineConfig } from "hardhat/config";
import hardhatEthers from "@nomicfoundation/hardhat-ethers";

const hardhatRpcUrl = process.env.HARDHAT_RPC_URL || "http://127.0.0.1:8545";

export default defineConfig({
    plugins: [hardhatEthers],
    solidity: "0.8.24",
    networks: {
        localhost: {
            type: "http",
            chainType: "l1",
            url: hardhatRpcUrl,
        },
    },
});


//Palikt situos, nes ant sepolia veike
//import dotenv from "dotenv";
//import { defineConfig } from "hardhat/config";
//import hardhatEthers from "@nomicfoundation/hardhat-ethers";
//import hardhatIgnition from "@nomicfoundation/hardhat-ignition";

//dotenv.config();

//const { SEPOLIA_RPC_URL, PRIVATE_KEY } = process.env;

//export default defineConfig({
//    solidity: "0.8.24",
//    plugins: [hardhatEthers, hardhatIgnition],
//    networks: {
//        sepolia: {
//            type: "http",
//            chainType: "l1",
//            url: SEPOLIA_RPC_URL || "",
//            accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
//        },
//    },
//});
