const { bscContract, tronContract } = require("./contracts.js");
const { weiToSun, sunToWei } = require("./utils/helper.js");

async function BscToTrc(from, to, value) {
  const trcBridge = await tronContract();
  const bscBridge = bscContract();
  let _tempValue = weiToSun(value);
  const trc_tx = await trcBridge.withdraw(from, to, _tempValue).send();
  if (trc_tx) {
    await bscBridge.burn(from, value);
  }
}
async function TrcToBsc(from, to, value) {
  const trcBridge = await tronContract();
  const bscBridge = bscContract();
  let _tempValue = sunToWei(value);
  const bsc_tx = await bscBridge.withdraw(from, to, _tempValue);
  await bsc_tx.wait();
  if (bsc_tx) {
    await trcBridge.burn(from, value).send();
  }
}

module.exports = {
  BscToTrc,
  TrcToBsc,
};
