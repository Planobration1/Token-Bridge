const { testConfig } = require("./config.js");
const fs = require("fs");
const { bscContract, tronContract } = require("./contracts.js");

async function main() {
  console.log("start");
  const contract = bscContract();
  const filter = contract.filters["Deposit"]();
  contract.on(filter, async (event) => {
    console.log(event.args);
  });
}

main().catch((e) => console.error(e));
