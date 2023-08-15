import TronWeb from "tronweb";
import bigNumber from "bignumber.js";
import Config from "../config";

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

export const toBigNumber = tronWeb.toBigNumber;

// export const BigNumber = tronWeb.BigNumber;
export const BigNumber = bigNumber;

export const toDecimal = tronWeb.toDecimal;

export const getTrxBalance = (address) => {
  return tronWeb.trx.getBalance(address);
};

export const fromHex = (hexString) => {
  return tronWeb.address.fromHex(hexString.replace("/^0x/", "41"));
};

export const addressToHex = (addr) => {
  return tronWeb.address.toHex(addr);
};

export const isAddress = (address) => {
  return tronWeb.isAddress(address);
};
