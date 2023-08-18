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
    token: "0x8178ae31580a2C2B1F888E4Ed003FAb0ccF3BdC7",
    bridge: "0xab75c23ac62303056d9f03193c3261f1f9f4161b",
  },
  trx: {
    rpc: "https://api.trongrid.io",
    wss: "wss://api.trongrid.io",
    key: TRONGRID_API_KEY,
    ...account.trx,
    token: "TQJ7w9YDWNKSPu78LZ2c9T8S9rvjugszmG",
    bridge: "TE7dXopHdcQeMiEmSESRX4BBpvBBFfjbDc",
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
