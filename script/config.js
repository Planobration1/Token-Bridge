require("dotenv").config();

const { TRC_PRIVATE_KEY, BSC_PRIVATE_KEY, TRONGRID_API_KEY, BSC_RPC, BSC_WSS } =
  process.env;

let devEnv = true;
let fullHost = devEnv ? "https://nile.trongrid.io" : "https://api.trongrid.io";

const Config = {
  version: "v1.0.0",
  chain: {
    privateKey: TRC_PRIVATE_KEY,
    fullHost,
    trongrid_key: TRONGRID_API_KEY,
  },
};

const account = {
  bsc: {
    address: "0x2a28f144555131EeAd6D25F024eD872553609EDC",
    privateKey: BSC_PRIVATE_KEY,
  },
  trx: {
    address: "TTdVBtmg3XojVd2vV29S56jcfQuHFxPzov",
    privateKey: TRC_PRIVATE_KEY,
  },
};

const testConfig = {
  bsc: {
    rpc: `${BSC_RPC}/testnet`,
    wss: `${BSC_WSS}/testnet`,
    ...account.bsc,
    token: "0x26607c5440f2b33c5c5355d15Ed766e9127D4878",
    bridge: "0xa3Bc240484fA01332F68BcdE7050c15f8Bf73270",
  },
  trx: {
    rpc: "https://api.trongrid.io",
    wss: "wss://api.trongrid.io",
    key: TRONGRID_API_KEY,
    ...account.trx,
    token: "THfvs3htgGDbUXT1bKgbyncUy2rdxdDbu1",
    bridge: "TGHrCcF13UbkNHMqKUgTUeitp85pSqFRim",
  },
};

const prodConfig = {
  bsc: {
    wss: `${BSC_WSS}/mainnet`,
    rpc: `${BSC_RPC}/mainnet`,
    ...account.bsc,
    token: "",
    bridge: "",
  },
  trx: {
    ...testConfig.trx,
    token: "",
    bridge: "",
    rpc: "https://api.shasta.trongrid.io",
  },
};

module.exports = {
  account,
  testConfig,
  prodConfig,
  Config,
};
