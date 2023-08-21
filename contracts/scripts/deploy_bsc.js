const hre = require("hardhat");
const { testConfig, prodConfig, devEnv } = require("../../script/config.js");
const { appendFileSync } = require("fs");

async function main() {
  const config = devEnv ? testConfig.bsc : prodConfig.bsc;
  const _token = config.token;
  const _whitelist = config.address;
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
