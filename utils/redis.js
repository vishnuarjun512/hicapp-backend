import redisClient from "../config/redis.js";

export const redisGet = async (key) => {
  return await redisClient.get(key);
};

export const redisSet = async (key, value, ttlSeconds) => {
  return await redisClient.set(key, value, {
    EX: ttlSeconds,
  });
};

export const redisDelete = async (key) => {
  return await redisClient.del(key);
};

export const redisIncrement = async (key) => {
  return await redisClient.incr(key);
};

export const redisExpire = async (key, time) => {
  return await redisClient.expire(key, time);
};
