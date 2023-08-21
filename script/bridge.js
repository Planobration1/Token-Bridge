const { bscContract, tronContract } = require("./contracts.js");
const { testConfig } = require("./config.js");

async function BscToTrc(from, to, value) {
  const trcBridge = await tronContract();
  const bscBridge = bscContract();
  const trc_tx = await trcBridge.withdraw(from, to, value).send();
  if (trc_tx) {
    await bscBridge.burn(from, value);
  }
}
async function TrcToBsc(from, to, value) {
  const trcBridge = await tronContract();
  const bscBridge = bscContract();
  const bsc_tx = await bscBridge.withdraw(from, to, value);
  await bsc_tx.wait();
  if (bsc_tx) {
    await trcBridge.burn(from, value).send();
  }
}

async function bridgeToTron(from, to, value) {
  const functionSelector = "withdraw(string,address,uint256)";
  const parameter = [
    { type: "string", value: from },
    { type: "address", value: to },
    { type: "uint256", value: value },
  ];
  const tx = await tronWeb.transactionBuilder.triggerSmartContract(
    testConfig.trx.bridge,
    functionSelector,
    {},
    parameter
  );
  const signedTx = await tronWeb.trx.sign(tx.transaction);
  const result = await tronWeb.trx.sendRawTransaction(signedTx);
}

module.exports = {
  BscToTrc,
  TrcToBsc,
};
