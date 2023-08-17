let data = {
  filter: {
    fragment: {
      type: "event",
      inputs: [Array],
      name: "Deposit",
      anonymous: false,
    },
  },
  emitter: {
    target: "0xa3Bc240484fA01332F68BcdE7050c15f8Bf73270",
    interface: {
      fragments: [Array],
      deploy: [ConstructorFragment],
      fallback: null,
      receive: false,
    },
    runner: {
      provider: {},
      address: "0x2a28f144555131EeAd6D25F024eD872553609EDC",
    },
    filters: {},
    fallback: null,
    [Symbol(_ethersInternal_contract)]: {},
  },
  log: {
    provider: {},
    transactionHash:
      "0x7a8de0b9b40cb1c079b3ce4349bc2cdbeb90450c70e9a325a6878642030a7bed",
    blockHash:
      "0x0b66bc49147095cddd5cb6e8dc97ce1560484e8f41b0973a86b88e9fafe1820b",
    blockNumber: 32529002,
    removed: false,
    address: "0xa3Bc240484fA01332F68BcdE7050c15f8Bf73270",
    data: "0x00000000000000000",
    topics: [
      "0x2d4b597935f3cd67fb2eebf1db4debc934cee5c7baa7153f980fdbeb2e74084e",
      "0x0000000000000000000000002a28f144555131eead6d25f024ed872553609edc",
    ],
    index: 62,
    transactionIndex: 22,
    interface: {
      deploy: [ConstructorFragment],
      fallback: null,
      receive: false,
    },
    fragment: {
      type: "event",
      inputs: [Array],
      name: "Deposit",
      anonymous: false,
    },
    args: Result(3)[
      ("0x2a28f144555131EeAd6D25F024eD872553609EDC",
      "TTdVBtmg3XojVd2vV29S56jcfQuHFxPzov",
      19000000000000000000n)
    ],
  },
  args: Result(3)[
    ("0x2a28f144555131EeAd6D25F024eD872553609EDC",
    "TTdVBtmg3XojVd2vV29S56jcfQuHFxPzov",
    19000000000000000000n)
  ],
  fragment: {
    type: "event",
    inputs: [[ParamType], [ParamType], [ParamType]],
    name: "Deposit",
    anonymous: false,
  },
};
