const { kv } = require("@vercel/kv");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

async function redisClient(action, hash) {
  let result = false;

  if (action === "set") {
    await kv.sadd("transactions", hash);
  }
  if (action === "get") {
    result = await kv.sismember("transactions", hash);
  }
  return result;
}

module.exports = {
  redisClient,
};
