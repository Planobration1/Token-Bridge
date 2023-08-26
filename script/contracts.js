const {
  Contract,
  Wallet,
  WebSocketProvider,
  JsonRpcProvider,
} = require("ethers");
const { tronWeb } = require("./utils/index.js");
const bridgeAbi = require("./abi/bridge.json");
const { config, errorHandler } = require("./config.js");

function bscContract() {
  const bsc = config.bsc;
  const { bridge, privateKey, wss, rpc } = bsc;
  const provider = new WebSocketProvider(wss);
  const jsonProvider = new JsonRpcProvider(rpc);
  const wallet = new Wallet(privateKey, provider);
  const bridgeContract = new Contract(bridge, bridgeAbi, wallet);
  return { bridgeContract, provider: jsonProvider };
}
async function tronContract() {
  try {
    const tron = config.trx;
    const { bridge } = tron;
    const bridgeContract = await tronWeb.contract(bridgeAbi, bridge);
    return bridgeContract;
  } catch (error) {
    console.error(errorHandler("TRC", error, "contracts.js", "tronContract"));
  }
}

module.exports = {
  bscContract,
  tronContract,
};
