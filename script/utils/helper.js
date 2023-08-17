const TronWeb = require("tronweb");
const bigNumber = require("bignumber.js");
const { Config } = require("../config.js");

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

module.exports = {
  toBigNumber,
  BigNumber,
  toDecimal,
  getTrxBalance,
  fromHex,
  addressToHex,
  isAddress,
};
