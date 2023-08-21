const hre = require("hardhat");
const { config } = require("../../script/config.js");
const { appendFileSync } = require("fs");

async function main() {
  const _token = config.bsc.token;
  const _whitelist = config.bsc.address;
  const bridge = await hre.ethers.deployContract("Bridge", [
    _token,
    _whitelist,
  ]);

  await bridge.deployed();

  console.log(`BSC Bridge deployed to ${bridge.address}`);
  appendFileSync(
    "../deployments.txt",
    `
  BSC Bridge deployed to ${bridge.address} \n
  `
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
