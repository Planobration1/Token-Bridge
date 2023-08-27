const { createClient } = require("redis");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

async function redisClient(action, hash) {
  const client = createClient({
    url: process.env.REDIS_URL,
  });

  let result = false;

  await client.connect();

  if (action === "set") {
    await client.sAdd("transactions", hash);
  }
  if (action === "get") {
    result = await client.sIsMember("transactions", hash);
  }

  await client.quit();

  return result;
}

module.exports = {
  redisClient,
};
