const { tronWeb } = require("./utils/index.js");
const { testConfig } = require("./config.js");
const fs = require("fs");

async function main() {
  console.log("start");
  let currentBlock = 0;
  const contract = testConfig.trx.token;
  setInterval(async () => {
    try {
      const events = await tronWeb.getEventResult(contract, {
        eventName: "Transfer",
        // size: 1,
        onlyConfirmed: true,
      });
      if (currentBlock == events[0].block) return;
      currentBlock = events[0].block;
      for (let event of events) {
        fs.appendFileSync(
          "event.txt",
          `
    Block: ${event.block}
    Transaction: ${event.transaction}
          ` + "\n"
        );
      }
    } catch (error) {
      console.log(error);
    }
  }, 5000);

  tronWeb.on("block", async (block) => {
    const events = await tronWeb.getEventResult(
      testConfig.trx.bridge,
      block.number
    );
    console.log(events);
  });
}

main().catch((e) => console.error(e));
