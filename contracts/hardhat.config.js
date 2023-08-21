require("@nomiclabs/hardhat-ethers");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const { BSC_PRIVATE_KEY, BSC_RPC } = process.env;

module.exports = {
  networks: {
    bscTestnet: {
      url: BSC_RPC,
      chainId: 97, // BSC testnet chain ID
      accounts: [BSC_PRIVATE_KEY], // Array of private keys for deploying contract
    },
  },
  solidity: "0.8.0", // or your preferred version
};
