import { createClient } from "redis";

const redisClient = createClient({
  url: process.env.WINDOWS_REDIS_URL,
  RESP: 2, // Forces the client to use RESP2 protocol (compatible with Redis 3.x)
});

redisClient.on("error", (error) => {
  console.log("Redis Client Error: ", error);
});

export default redisClient;
