import { createClient } from "redis";

const redisClient = createClient({
  url: process.env.REDIS_URL,
});

redisClient.on("error", (error) => {
  console.log("Redis Client Error: ", error);
});

export default redisClient;
