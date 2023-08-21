const { tronWeb } = require("../../script/utils/");
const funcABIV2_4 = require("../artifacts/contracts/BSCBridge.sol/Bridge.json");
const { testConfig, prodConfig, devEnv } = require("../../script/config.js");
const { appendFileSync } = require("fs");

async function main() {
  const config = devEnv ? testConfig.bsc : prodConfig.bsc;
  const _token = config.token;
  const _whitelist = config.address;
  const transaction = await tronWeb.transactionBuilder.createSmartContract({
    abi: funcABIV2_4.abi,
    bytecode: funcABIV2_4.bytecode,
  });
  await tronWeb.trx.sendRawTransaction(await tronWeb.trx.sign(transaction));
  while (true) {
    const tx = await tronWeb.trx.getTransaction(transaction.txID);
    if (Object.keys(tx).length === 0) {
      await new Promise((r) => setTimeout(r, 3000));
      continue;
    } else {
      break;
    }
  }
  console.log(`
  TRC Bridge deployed to ${transaction.contract_address}
  `);
  appendFileSync(
    "../deployments.txt",
    `
  TRC Bridge deployed to ${transaction.contract_address} \n
  `
  );
}
