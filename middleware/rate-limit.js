import { sendJson } from "../utils/http.js";
import { redisIncrement, redisExpire, redisGet } from "../utils/redis.js";

const LOGIN_LIMIT = 5;
const LOGIN_WINDOW_SECONDS = 15 * 60;

const getClientIp = (req) => {
  return req.socket.remoteAddress;
};

export const checkLoginRateLimit = async (req, res) => {
  try {
    const ip = getClientIp(req);

    const key = `rate:login:${ip}`;

    console.log("RATE LIMIT IP:", ip);
    console.log("RATE LIMIT KEY:", key);

    const attempts = Number(await redisGet(key)) || 0;

    if (attempts >= LOGIN_LIMIT) {
      return false;
    }

    return true;
  } catch (error) {
    console.error("LOGIN RATE LIMIT CHECK ERROR:", error);

    // Redis failure should not take authentication down.
    return true;
  }
};

export const recordFailedLogin = async (req) => {
  try {
    const ip = getClientIp(req);

    const key = `rate:login:${ip}`;

    const attempts = await redisIncrement(key);

    if (attempts === 1) {
      await redisExpire(key, LOGIN_WINDOW_SECONDS);
    }
  } catch (error) {
    console.error("FAILED LOGIN RATE LIMIT ERROR:", error);
  }
};
