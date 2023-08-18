const { bscContract, tronContract } = require("./contracts.js");

async function BscToTrc(from, to, value) {
  const trcBridge = await tronContract();
  const bscBridge = bscContract();
  const trc_tx = await trcBridge.withdraw(from, to, value).send();
  if (trc_tx) {
    await bscBridge.burn(from, value);
  }
}
async function TrcToBsc(from, to, value) {
  const trcBridge = await tronContract();
  const bscBridge = bscContract();
  const bsc_tx = await bscBridge.withdraw(from, to, value);
  await bsc_tx.wait();
  if (bsc_tx) {
    await trcBridge.burn(from, value).send();
  }
}

module.exports = {
  BscToTrc,
  TrcToBsc,
};
