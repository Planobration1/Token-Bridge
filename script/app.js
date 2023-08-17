const { Contract, JsonRpcProvider, Wallet } = require("ethers");
const { tronWeb } = require("./utils/index.js");
const bridgeAbi = require("./abi/bridge.json");
const tokenAbi = require("./abi/erc20.json");
const { testConfig } = require("./config.js");

function bscContract() {
  const bsc = testConfig.bsc;
  const { rpc, bridge, privateKey } = bsc;
  const provider = new JsonRpcProvider(rpc);
  const wallet = new Wallet(privateKey, provider);
  const bridgeContract = new Contract(bridge, bridgeAbi, wallet);
  return { bridgeContract };
}
function tronContract() {
  const tron = testConfig.trx;
  const { bridge, privateKey, token } = tron;
  // const bridgeContract = tronWeb.contract(bridgeAbi, bridge);
  // bridgeContract.setPrivateKey(privateKey);
  const tokenContract = tronWeb.contract(tokenAbi, token);
  return { tokenContract };
}

async function bridgeToTrc(from, to, value) {
  const { bridgeContract: trcBridge } = tronContract();
  const { bridgeContract: bscBridge } = bscContract();
  const trc_tx = await trcBridge.withdraw(from, to, value).send();
  if (trc_tx) {
    await bscBridge.burn(from, value);
  }
}
async function bridgeToBsc(from, to, value) {
  const { bridgeContract: trcBridge } = tronContract();
  const { bridgeContract: bscBridge } = bscContract();
  const bsc_tx = await bscBridge.withdraw(from, to, value);
  if (bsc_tx) {
    await trcBridge.burn(from, value).send();
  }
}

async function buildTx() {
  const functionSelector = "transfer(address,uint256)";
  const parameter = [
    { type: "address", value: "TVzPMfKckXBQ6gq3zQp5SbtMj4aqNb2Dw2" },
    { type: "uint256", value: 100 },
  ];
  const tx = await tronWeb.transactionBuilder.triggerSmartContract(
    "TG3XXyExBkPp9nzdajDZsozEu4BkaSJozs",
    functionSelector,
    {},
    parameter
  );
  const signedTx = await tronWeb.trx.sign(tx.transaction);
  const result = await tronWeb.trx.sendRawTransaction(signedTx);
  console.log(result);
}

async function main() {
  // const { bridgeContract: bscBridge } = bscContract();
  // await buildTx();
  const tokenContract = await tronWeb.contract(tokenAbi, testConfig.trx.token);
  const txID = await tokenContract
    .transfer("TVzPMfKckXBQ6gq3zQp5SbtMj4aqNb2Dw2", "1000000")
    .send();
  let result = await tronWeb.trx.getTransaction(txID);
  console.log(txID);
  console.log(result);
  // const bscFilter = bscBridge.filters["Deposit"]();
  // bscBridge.on(bscFilter, await bridgeToTrc(from, to, value));
  // const trcFilter = trcBridge.filters["Deposit"]();
  // trcBridge.on(trcFilter, await bridgeToBsc(from, to, value));
}
main().catch((e) => console.log(e));
