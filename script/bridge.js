const { bscContract, tronContract } = require("./contracts.js");
const { config } = require("./config.js");

async function BscToTrc(from, to, value) {
  try {
    const trcBridge = await tronContract();
    const bscBridge = bscContract();
    await trcBridge.withdraw(from, to, value).send();
    await new Promise((resolve) => setTimeout(resolve, 4000));
    await bscBridge.burn(from, value);
  } catch (error) {
    console.log(error);
  }
}
async function TrcToBsc(from, to, value) {
  try {
    const trcBridge = await tronContract();
    const bscBridge = bscContract();
    const bsc_tx = await bscBridge.withdraw(from, to, value);
    await bsc_tx.wait();
    if (bsc_tx) {
      await trcBridge.burn(from, value).send();
    }
  } catch (e) {
    console.log(e);
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
    config.trx.bridge,
    functionSelector,
    {},
    parameter
  );
  const signedTx = await tronWeb.trx.sign(tx.transaction);
  const result = await tronWeb.trx.sendRawTransaction(signedTx);
  return result;
}

module.exports = {
  BscToTrc,
  TrcToBsc,
};
