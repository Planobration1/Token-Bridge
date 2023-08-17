const { bscContract } = require("./contracts.js");
const { TrcToBsc, BscToTrc } = require("./bridge.js");
const { testConfig } = require("./config.js");
const { tronWeb } = require("./utils/index.js");

async function main() {
  console.log("Script start");
  const BSC = bscContract();
  const filter = BSC.filters["Deposit"]();
  BSC.on(filter, async (event) => {
    const [from, to, value] = event.args;
    console.log(from, to, value, "BSC Handler");
    await BscToTrc(from, to, value.toString());
  });
  let currentBlock = 0;
  const contract = testConfig.trx.bridge;
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
        const { from, to, value } = event.result;
        console.log(from, to, value, "Tron Handler");
        await TrcToBsc(from, to, value.toString());
      }
    } catch (error) {
      console.log(error);
    }
  }, 2000);
}
main().catch((e) => console.log(e));
