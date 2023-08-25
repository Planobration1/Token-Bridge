const { bscContract } = require("./contracts.js");
const { TrcToBsc, BscToTrc } = require("./bridge.js");
const { config, errorHandler } = require("./config.js");
const { tronWeb } = require("./utils/index.js");

const processedIds = new Set();

async function main() {
  console.log("Script start");

  /// @dev bsc bridge handler
  const { bridgeContract: BSC, provider } = bscContract();
  const filter = BSC.filters["Deposit"]();
  BSC.on(filter, async (event) => {
    try {
      let txHash = event.log.transactionHash;
      if (!processedIds.has(txHash)) {
        processedIds.add(txHash);
        const [from, to, value] = event.args;
        console.log(from, to, value, "BSC Handler");
        await BscToTrc(from, to, value.toString());
      }
    } catch (error) {
      console.error(errorHandler("BSC", error, "app.js", "BSC.on"));
    }
  });

  /// @dev tron bridge handler
  let currentBlock = 0;
  const contract = config.trx.bridge;
  setInterval(async () => {
    try {
      const blockHex = await tronWeb.trx.getCurrentBlock();
      const block = blockHex.block_header.raw_data.number;
      if (currentBlock == block) return;
      currentBlock = block;
      const events = await tronWeb.getEventResult(contract, {
        eventName: "Deposit",
        onlyConfirmed: true,
        blockNumber: block,
      });
      for (let event of events) {
        const { result, transaction } = event;
        if (!processedIds.has(transaction)) {
          processedIds.add(transaction);
          const { from, to, value } = result;
          console.log(from, to, value, "Tron Handler");
          await TrcToBsc(from, to, value.toString());
        }
      }
    } catch (error) {
      console.log(
        errorHandler("TRC", error, "app.js", "tronWeb.getEventResult")
      );
    }
  }, 2000);

  /// @dev fallback for bsc bridge handler
  let bscBlock = 0;
  setInterval(async () => {
    try {
      const block = await provider.getBlockNumber();
      if (bscBlock == block) return;
      bscBlock = block;
      const events = await BSC.queryFilter(filter, block - 140);
      for (let event of events) {
        let { transactionHash, args } = event;
        if (!processedIds.has(transactionHash)) {
          processedIds.add(transactionHash);
          const [from, to, value] = args;
          console.log(from, to, value, "BSC Handler fallback");
          await BscToTrc(from, to, value.toString());
        }
      }
    } catch (error) {
      console.log(errorHandler("BSC", error, "app.js", "BSC.queryFilter"));
    }
  }, 420000);
}
main().catch((e) => console.log(e));
