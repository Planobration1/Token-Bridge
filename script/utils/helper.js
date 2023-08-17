const TronWeb = require("tronweb");
const bigNumber = require("bignumber.js");
const { Config } = require("../config.js");
const { formatEther, formatUnits, parseEther, parseUnits } = require("ethers");

const chain = Config.chain;

const tronWeb = new TronWeb({
  fullHost: chain.fullHost,
});

bigNumber.config({ EXPONENTIAL_AT: 1e9 });
bigNumber.prototype._toFixed = function (...arg) {
  return new bigNumber(this.toFixed(...arg)).toString();
};
bigNumber.prototype._toBg = function () {
  return this;
};
bigNumber.prototype._toHex = function () {
  return `0x${this.toString(16)}`;
};

const toBigNumber = tronWeb.toBigNumber;

//  const BigNumber = tronWeb.BigNumber;
const BigNumber = bigNumber;

const toDecimal = tronWeb.toDecimal;

const getTrxBalance = (address) => {
  return tronWeb.trx.getBalance(address);
};

const fromHex = (hexString) => {
  return tronWeb.address.fromHex(hexString.replace("/^0x/", "41"));
};

const addressToHex = (addr) => {
  return tronWeb.address.toHex(addr);
};

const isAddress = (address) => {
  return tronWeb.isAddress(address);
};

function weiToSun(weiAmount) {
  let etherAmount = formatEther(weiAmount);
  let sunAmount = parseUnits(etherAmount, 6);
  let sunValue = Number(sunAmount.toString());
  return sunValue;
}

function sunToWei(sunAmount) {
  let sunValue = formatUnits(sunAmount, 6);
  let weiAmount = parseEther(sunValue);
  let weiValue = Number(weiAmount.toString());
  return weiValue;
}

module.exports = {
  toBigNumber,
  BigNumber,
  toDecimal,
  getTrxBalance,
  fromHex,
  addressToHex,
  isAddress,
  weiToSun,
  sunToWei,
};
