const { tronWeb } = require("../../script/utils/");
const {
  abi,
  bytecode,
} = require("../artifacts/contracts/BSCBridge.sol/Bridge.json");
const { testConfig, prodConfig, devEnv } = require("../../script/config.js");
const { appendFileSync } = require("fs");

async function main() {
  const config = devEnv ? testConfig.bsc : prodConfig.bsc;
  const _token = config.token;
  const _whitelist = config.address;
  const parameters = [_token, _whitelist];
  const contract = await tronWeb.contract().new({
    abi,
    bytecode,
    parameters,
  });
  const bridge = tronWeb.address.fromHex(contract.address);
  console.log(`
  TRC Bridge deployed to ${bridge.address}
  `);
  appendFileSync(
    "../deployments.txt",
    `
  TRC Bridge deployed to ${bridge.address} \n
  `
  );
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
