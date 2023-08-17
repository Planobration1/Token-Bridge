const env = process.env.REACT_APP_ENV;

const Config = {
  version: "v1.0.0",
  chain: {
    privateKey:
      "38340f2f2cd40de7be48fd656d8a0e23aaf5722b6d0d9dcc8af12f9c5bbbac27",
    // fullHost: "https://api.trongrid.io",
    fullHost: "https://api.shasta.trongrid.io",
    trongrid_key: "5a54bed3-7d2f-40a6-9741-d6d3605f4c7e",
  },
  trongrid: {
    host: "https://api.trongrid.io",
    key: "5a54bed3-7d2f-40a6-9741-d6d3605f4c7e",
  },
  service: {},
  contract: {
    usdt: "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t",
  },
  defaultDecimal: 6,
  tronLinkTime: 8,
  justSwap: "https://justswap.org/",
  tronscanUrl: "https://tronscan.io/#",
};

let devConfig = {};
if (env === "test") {
  devConfig = {
    chain: {
      privateKey: "01",
      fullHost: "https://api.nileex.io",
    },
    service: {},
    contract: {
      usdt: "TXYZopYRdj2D9XRtbG411XZZ3kM5VkAeBf",
    },
    justSwap: "https://justswap.org/",
    tronscanUrl: "https://nile.tronscan.io/#",
  };
}

const account = {
  bsc: {
    address: "0x2a28f144555131EeAd6D25F024eD872553609EDC",
    privateKey:
      "1fc63ea696f69a31e57d6639ddd5122b2a09bf31eaa70a9a43863abecc59643e",
  },
  trx: {
    address: "TTdVBtmg3XojVd2vV29S56jcfQuHFxPzov",
    privateKey:
      "38340f2f2cd40de7be48fd656d8a0e23aaf5722b6d0d9dcc8af12f9c5bbbac27",
  },
};

const testConfig = {
  bsc: {
    rpc: "https://bsc.getblock.io/a785e1f6-78b5-4771-a0d6-942d2fa34737/testnet/",
    wss: "wss://bsc.getblock.io/a785e1f6-78b5-4771-a0d6-942d2fa34737/testnet/",
    ...account.bsc,
    token: "",
    bridge: "",
  },
  trx: {
    rpc: "https://api.trongrid.io",
    key: "5a54bed3-7d2f-40a6-9741-d6d3605f4c7e",
    ...account.trx,
    token: "TG3XXyExBkPp9nzdajDZsozEu4BkaSJozs",
    bridge: "",
  },
};

const prodConfig = {
  bsc: {
    wss: "wss://bsc.getblock.io/a785e1f6-78b5-4771-a0d6-942d2fa34737/mainnet/",
    rpc: "https://bsc.getblock.io/a785e1f6-78b5-4771-a0d6-942d2fa34737/mainnet/",
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
  devConfig,
};

// export default Object.assign(Config, devConfig);
