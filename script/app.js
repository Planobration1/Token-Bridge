import { Contract, JsonRpcProvider, Wallet } from "ethers";
import { tronWeb } from "./utils";
import bridgeAbi from "./abi/bridge.json";
import erc20Abi from "./abi/erc20.json";
import { testConfig } from "./config";

function bscContract() {
  const bsc = testConfig.bsc;
  const { rpc, token, bridge, privateKey } = bsc;
  const provider = new JsonRpcProvider(rpc);
  const wallet = new Wallet(privateKey, provider);
  const bridgeContract = new Contract(bridge, bridgeAbi, wallet);
  const tokenContract = new Contract(token, erc20Abi, wallet);
  return { bridgeContract, tokenContract };
}

function tronContract() {
  const tron = testConfig.trx;
  const { token, bridge, privateKey } = tron;
  const bridgeContract = tronWeb.contract(bridgeAbi, bridge);
  const tokenContract = tronWeb.contract(erc20Abi, token);
  return { bridgeContract, tokenContract };
}

async function main() {}
