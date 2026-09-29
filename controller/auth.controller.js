import { BodyReader } from "../utils/dataReader.js";
import { readJWT } from "../utils/jwt.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import { sendError, sendJson } from "../utils/http.js";
import {
  createUserService,
  getUserForAuthenticationService,
  updateUserPasswordService,
} from "../services/user.service.js";

import {
  checkLoginRateLimit,
  recordFailedLogin,
} from "../middleware/rate-limit.js";
import { redisDelete, redisGet, redisSet } from "../utils/redis.js";
import { validateCredentials } from "../utils/validation.js";
import { setSessionCookies } from "../utils/cookies.js";

export const signInUser = async (req, res) => {
  try {
    const allowed = await checkLoginRateLimit(req, res);

    if (!allowed) {
      return sendError(res, 429, "Too many login attempts. Try again later.");
    }

    const credentials = await BodyReader(req);

    // validateCredentials(credentials);
    const email = credentials.email.trim().toLowerCase();

    let user = await redisGet(`user:${email}`);

    if (!user) {
      console.log("Redis Miss");
      user = await getUserForAuthenticationService(email);

      if (!user) {
        return sendError(res, 404, "User not found");
      }

      await redisSet(`user:${email}`, user, 5 * 60);
    } else {
      console.log("Redis Hit");
    }

    if (!user) {
      await recordFailedLogin(req);
      await redisDelete(`user:${email}`);
      return sendError(res, 404, "User not found");
    }

    // Existing plaintext passwords are upgraded on the user's next successful login.
    const passwordMatches = user.password.startsWith("scrypt:")
      ? await verifyPassword(credentials.password, user.password)
      : credentials.password === user.password;

    if (!passwordMatches) {
      await recordFailedLogin(req);
      await redisDelete(`user:${email}`);
      return sendError(res, 404, "Invalid Credentials");
    }

    if (!user.password.startsWith("scrypt:")) {
      await updateUserPasswordService(
        user.id,
        await hashPassword(credentials.password),
      );
    }

    const { password: _password, ...safeUser } = user;

    const {
      accessToken,
      refreshToken,
      accessTokenDuration,
      refreshTokenDuration,
    } = setSessionCookies(res, user.id);

    return sendJson(res, 200, {
      message: "Sign In Success",
      user: safeUser,
      accessToken,
      refreshToken,
      accessToken_Duration: accessTokenDuration,
      refreshToken_Duration: refreshTokenDuration,
    });
  } catch (error) {
    console.error("LOGIN ERROR -", error);
    return sendError(
      res,
      error.statusCode ?? 500,
      error.statusCode ? error.message : "Internal Server Error",
    );
  }
};

export const registerUser = async (req, res) => {
  try {
    const credentials = await BodyReader(req);
    validateCredentials(credentials);
    const email = credentials.email.trim().toLowerCase();
    const existingUser = await getUserForAuthenticationService(email);
    if (existingUser) return sendError(res, 409, "User already registered");

    const user = await createUserService(
      email,
      await hashPassword(credentials.password),
    );

    return sendJson(res, 201, { message: "Created User Successfully", user });
  } catch (error) {
    console.error("CREATE USER ERROR -", error);
    return sendError(
      res,
      error.statusCode ?? 500,
      error.statusCode ? error.message : "Internal Server Error",
    );
  }
};

export const refreshToken = async (req, res) => {
  try {
    const refreshCookie = req.headers.cookie
      ?.split("; ")
      .find((cookie) => cookie.startsWith("hicappRefreshToken="));

    const refreshValue = refreshCookie?.slice("hicappRefreshToken=".length);

    const payload = refreshValue && readJWT(refreshValue);

    if (!payload?.userId) {
      sendError(res, 401, "Session expired");
      return;
    }

    console.log("Token Refresh Succesful");
    setSessionCookies(res, payload.userId);
    return sendJson(res, 200, { message: "Token refreshed" });
  } catch (error) {
    console.error("REFRESH TOKEN CONTROLLER ERROR -", error);
    return sendError(
      res,
      error.statusCode ?? 500,
      error.statusCode ? error.message : "Internal Server Error",
    );
  }
};

export const logoutUser = async (_req, res) => {
  const expired = "HttpOnly; Path=/; Max-Age=0; SameSite=Lax";
  res.setHeader("Set-Cookie", [
    `hicappAccessToken=; ${expired}`,
    `hicappRefreshToken=; ${expired}`,
  ]);
  return sendJson(res, 200, { message: "Logged out successfully" });
};
