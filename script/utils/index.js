const TronWeb = require("tronweb");
const { Config } = require("../config");
const { BigNumber } = require("./helper");

const chain = Config.chain;

const DATA_LEN = 64;
const MAX_UINT256 =
  "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";
const { privateKey, trongrid_key, fullHost } = chain;

const mainchain = new TronWeb({
  fullHost: fullHost,
  headers: { "TRON-PRO-API-KEY": trongrid_key },
  privateKey,
  eventServer: fullHost,
});
const triggerSmartContract = async (
  address,
  functionSelector,
  options = {},
  parameters = []
) => {
  try {
    const tronweb = window.tronWeb;
    const transaction = await tronweb.transactionBuilder.triggerSmartContract(
      address,
      functionSelector,
      Object.assign({ feeLimit: 20 * 1e6 }, options),
      parameters
    );

    if (!transaction.result || !transaction.result.result) {
      throw new Error(
        "Unknown trigger error: " + JSON.stringify(transaction.transaction)
      );
    }
    return transaction;
  } catch (error) {
    throw new Error(error);
  }
};

const sign = async (transaction) => {
  try {
    const tronweb = window.tronWeb;
    const signedTransaction = await tronweb.trx.sign(transaction.transaction);
    return signedTransaction;
  } catch (error) {
    console.log(error, "signerr");
    throw new Error(error);
  }
};

const sendRawTransaction = async (signedTransaction) => {
  try {
    const tronweb = window.tronWeb;
    const result = await tronweb.trx.sendRawTransaction(signedTransaction);
    return result;
  } catch (error) {
    throw new Error(error);
  }
};

const view = async (
  address,
  functionSelector,
  parameters = [],
  isDappTronWeb = true
) => {
  try {
    let tronweb = mainchain;
    if (!isDappTronWeb && window.tronWeb && window.tronWeb.ready) {
      tronweb = window.tronWeb;
    }
    const result = await tronweb.transactionBuilder.triggerSmartContract(
      address,
      functionSelector,
      { _isConstant: true },
      parameters
    );
    return result && result.result ? result.constant_result : [];
  } catch (error) {
    console.log(
      `view error ${address} - ${functionSelector}`,
      error.message ? error.message : error
    );
    return [];
  }
};

const getTrxBalance = async (address, isDappTronWeb = false) => {
  try {
    let tronWeb = mainchain;
    if (!isDappTronWeb && window.tronWeb && window.tronWeb.ready) {
      tronWeb = window.tronWeb;
    }
    const balance = await tronWeb.trx.getBalance(address);
    return {
      balance: BigNumber(balance).div(Config.defaultDecimal),
      success: true,
    };
  } catch (err) {
    console.log(`getPairBalance: ${err}`, address);
    return {
      balance: BigNumber(0),
      success: false,
    };
  }
};

const getTransactionInfo = (tx) => {
  const tronWeb = mainchain;
  return new Promise((resolve, reject) => {
    tronWeb.trx.getConfirmedTransaction(tx, (e, r) => {
      if (!e) {
        resolve(r);
      } else {
        reject(e, null);
      }
    });
  });
};

const getTRC20Balance = async (tokenAddress, userAddress) => {
  console.log("params of getbalance: ", userAddress, tokenAddress);
  const result = await view(tokenAddress, "balanceOf(address)", [
    { type: "address", value: userAddress },
  ]);
  let value = BigNumber(0);
  let success = false;

  if (result.length) {
    value = new BigNumber(result[0].slice(0, DATA_LEN), 16);
    success = true;
  }

  return {
    value,
    success,
  };
};
module.exports = {
  tronWeb: mainchain,
};
