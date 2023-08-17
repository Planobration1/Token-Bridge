import { Contract, JsonRpcProvider, Wallet } from "ethers";
import { tronWeb } from "./utils";
import bridgeAbi from "./abi/bridge.json";
import { testConfig } from "./config";

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
  const { bridge, privateKey } = tron;
  const bridgeContract = tronWeb.contract(bridgeAbi, bridge);
  return { bridgeContract };
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

async function main() {
  const { bridgeContract: bscBridge } = bscContract();
  const { bridgeContract: trcBridge } = tronContract();
  const bscFilter = bscBridge.filters["Deposit"]();
  bscBridge.on(bscFilter, await bridgeToTrc(from, to, value));
  const trcFilter = trcBridge.filters["Deposit"]();
  trcBridge.on(trcFilter, await bridgeToBsc(from, to, value));
}
await main().catch((e) => console.log(e));
