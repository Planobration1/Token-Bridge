// require("dotenv").config();
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

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
    address: "0xF4900bd12C3D6650e10dd04b89233494eA14ef74",
    privateKey: BSC_PRIVATE_KEY,
  },
  trx: {
    address: "TQFHVkPYjX9omaLbJQyoysTWeWVgf16D2F",
    privateKey: TRC_PRIVATE_KEY,
  },
};

const testConfig = {
  bsc: {
    rpc: `${BSC_RPC}/testnet`,
    wss: `${BSC_WSS}/testnet`,
    ...account.bsc,
    token: "0x8178ae31580a2C2B1F888E4Ed003FAb0ccF3BdC7",
    bridge: "0x2EfAbFBa5D80cf0e99FEB1aDEAD129eD6d2AD003",
  },
  trx: {
    rpc: "https://api.trongrid.io",
    wss: "wss://api.trongrid.io",
    key: TRONGRID_API_KEY,
    ...account.trx,
    token: "TQJ7w9YDWNKSPu78LZ2c9T8S9rvjugszmG",
    bridge: "TNsqxuyvhW8UNPkz894kgNqqvUcE4uE4Fx",
  },
};

const prodConfig = {
  bsc: {
    wss: `${BSC_WSS}/mainnet`,
    rpc: `${BSC_RPC}/mainnet`,
    ...account.bsc,
    token: "0x68Bc800Dd616911e1C6E7852e607c6e46ba81636",
    bridge: "0xb21e8da99a2db296dc2655a7840fe4318d4f1cd5",
  },
  trx: {
    ...testConfig.trx,
    token: "TEnbqY7jSJZRtPjCW4HsdpxBt9yRKmFKPf",
    bridge: "TTcGhjnuJjFg4kw4MZ6hskScGWphrUqmNP",
  },
};

const config = devEnv ? testConfig : prodConfig;

module.exports = {
  account,
  Config,
  config,
};
