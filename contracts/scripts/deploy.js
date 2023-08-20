const hre = require("hardhat");

async function main() {
  const [token, whitelist] = [
    "0x8178ae31580a2C2B1F888E4Ed003FAb0ccF3BdC7",
    "0x2a28f144555131EeAd6D25F024eD872553609EDC",
  ];
  const bridge = await hre.ethers.deployContract("Bridge", [token, whitelist]);

  await bridge.deployed();

  console.log(`Bridge deployed to ${bridge.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
