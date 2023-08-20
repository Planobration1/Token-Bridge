require("@nomiclabs/hardhat-ethers");

module.exports = {
  networks: {
    bscTestnet: {
      url: "https://bsc.getblock.io/a785e1f6-78b5-4771-a0d6-942d2fa34737/testnet/",
      chainId: 97, // BSC testnet chain ID
      accounts: [
        "1fc63ea696f69a31e57d6639ddd5122b2a09bf31eaa70a9a43863abecc59643e",
      ], // Array of private keys for deploying accounts
    },
  },
  solidity: "0.8.0", // or your preferred version
};
