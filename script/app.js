const { bscContract } = require("./contracts.js");
const { TrcToBsc, BscToTrc } = require("./bridge.js");
const { config, errorHandler } = require("./config.js");
const { tronWeb } = require("./utils/index.js");
const { redisClient } = require("./redis.js");

async function getBlockTimestamp() {
  const { provider } = bscContract();
  const blockHex = await tronWeb.trx.getCurrentBlock();
  const _timestamp = blockHex.block_header.raw_data.timestamp;
  const _bscblock = await provider.getBlockNumber();
  return [_bscblock, _timestamp];
}

async function bscFallback(bscBlock, filter) {
  const { provider, bridgeContract: BSC } = bscContract();
  const block = await provider.getBlockNumber();
  const events = await BSC.queryFilter(filter, bscBlock, block);
  bscBlock = block;
  for (let event of events) {
    let { transactionHash, args } = event;
    let exists = await redisClient("get", transactionHash);
    if (!exists) {
      await redisClient("set", transactionHash);
      const [from, to, value] = args;
      console.log(from, to, value, "BSC Handler fallback");
      await BscToTrc(from, to, value.toString());
    }
  }
  return block;
}

async function trcLoop(trcTimestamp, contract) {
  const blockHex = await tronWeb.trx.getCurrentBlock();
  const _timestamp = blockHex.block_header.raw_data.timestamp;
  const events = await tronWeb.getEventResult(contract, {
    eventName: "Deposit",
    onlyConfirmed: true,
    sinceTimestamp: trcTimestamp,
    sort: "block_timestamp",
  });
  for (let event of events) {
    const { result, transaction } = event;
    let exists = await redisClient("get", transaction);
    if (!exists) {
      await redisClient("set", transaction);
      const { from, to, value } = result;
      console.log(from, to, value, "Tron Handler");
      await TrcToBsc(from, to, value.toString());
    }
  }
  return _timestamp;
}

async function main() {
  console.log("Script start");
  const sevenMinutes = 420000;

  /// @dev get latest block number and timestamp for both chains
  let [bscBlock, trcTimestamp] = await getBlockTimestamp();

  /// @dev bsc bridge handler websocket
  const { bridgeContract: BSC } = bscContract();
  const filter = BSC.filters["Deposit"]();
  // BSC.on(filter, async (event) => {
  //   try {
  //     let txHash = event.log.transactionHash;
  //     await redisClient("set", txHash);
  //     const [from, to, value] = event.args;
  //     console.log(from, to, value, "BSC Handler");
  //     await BscToTrc(from, to, value.toString());
  //   } catch (error) {
  //     console.error(errorHandler("BSC", error, "app.js", "BSC.on"));
  //   }
  // });

  /// @dev tron bridge handler
  const contract = config.trx.bridge;
  setInterval(async () => {
    try {
      trcTimestamp = await trcLoop(trcTimestamp, contract);
    } catch (error) {
      console.log(
        errorHandler("TRC", error, "app.js", "tronWeb.getEventResult")
      );
    }
  }, sevenMinutes);

  /// @dev fallback for bsc bridge handler
  setInterval(async () => {
    try {
      bscBlock = await bscFallback(bscBlock, filter);
    } catch (error) {
      if (error.message.includes("server response 503 Service Unavailable")) {
        console.log("BSC server response 503 Service Unavailable");
        bscBlock = await bscFallback(bscBlock, filter);
      } else
        console.log(errorHandler("BSC", error, "app.js", "BSC.queryFilter"));
    }
  }, sevenMinutes);
}
main().catch((e) => console.log(errorHandler("Bridge", e, "app.js", "main()")));
