const { bscContract, tronContract } = require("./contracts.js");
const { TrcToBsc, BscToTrc } = require("./bridge.js");

async function main() {
  console.log("Script start");
  const BSC = bscContract();
  const filter = BSC.filters["Deposit"]();
  BSC.on(filter, async (event) => {
    console.log(event.args);
    const [from, to, value] = event.args;
    await BscToTrc(from, to, value.toString());
  });
  console.log("start");
  let currentBlock = 0;
  const contract = testConfig.trx.bridge;
  setInterval(async () => {
    try {
      console.log("Loop started");
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
        await TrcToBsc(from, to, value);
      }
    } catch (error) {
      console.log(error);
    }
  }, 2000);
}
main().catch((e) => console.log(e));

/*
async function buildTx() {
  const functionSelector = "transfer(address,uint256)";
  const parameter = [
    { type: "address", value: testConfig.trx.bridge },
    { type: "uint256", value: 1000000 },
  ];
  const tx = await tronWeb.transactionBuilder.triggerSmartContract(
    testConfig.trx.token,
    functionSelector,
    {},
    parameter
  );
  const signedTx = await tronWeb.trx.sign(tx.transaction);
  const result = await tronWeb.trx.sendRawTransaction(signedTx);
  console.log(result.txid);
}
*/
