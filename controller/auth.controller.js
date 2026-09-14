import jwt from "jsonwebtoken";
import { BodyReader } from "../utils/dataReader.js";
import { readJWT } from "../utils/jwt.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import { sendError, sendJson } from "../utils/http.js";
import {
  createUserService,
  getUserForAuthenticationService,
  updateUserPasswordService,
} from "../services/user.service.js";

const ACCESS_TOKEN_MAX_AGE = 5 * 60;
const REFRESH_TOKEN_MAX_AGE = 10 * 60;

const cookieOptions = (maxAge) => {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `HttpOnly; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`;
};

const createToken = (userId, expiresIn) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn });

const setSessionCookies = (res, userId) => {
  res.setHeader("Set-Cookie", [
    `hicappAccessToken=${createToken(userId, "5m")}; ${cookieOptions(ACCESS_TOKEN_MAX_AGE)}`,
    `hicappRefreshToken=${createToken(userId, "10m")}; ${cookieOptions(REFRESH_TOKEN_MAX_AGE)}`,
  ]);
};

const validateCredentials = ({ email, password }) => {
  if (typeof email !== "string" || !email.trim() || typeof password !== "string" || password.length < 8) {
    const error = new Error("Email and a password of at least 8 characters are required");
    error.statusCode = 400;
    throw error;
  }
};

export const signInUser = async (req, res) => {
  try {
    const credentials = await BodyReader(req);
    validateCredentials(credentials);
    const user = await getUserForAuthenticationService(credentials.email.trim());
    if (!user) return sendError(res, 401, "Invalid email or password");

    // Existing plaintext passwords are upgraded on the user's next successful login.
    const passwordMatches = user.password.startsWith("scrypt:")
      ? await verifyPassword(credentials.password, user.password)
      : credentials.password === user.password;
    if (!passwordMatches) return sendError(res, 401, "Invalid email or password");

    if (!user.password.startsWith("scrypt:")) {
      await updateUserPasswordService(user.id, await hashPassword(credentials.password));
    }

    const { password: _password, ...safeUser } = user;
    setSessionCookies(res, user.id);
    return sendJson(res, 200, { message: "Sign In Success", user: safeUser });
  } catch (error) {
    console.error("LOGIN ERROR -", error);
    return sendError(res, error.statusCode ?? 500, error.statusCode ? error.message : "Internal Server Error");
  }
};

export const registerUser = async (req, res) => {
  try {
    const credentials = await BodyReader(req);
    validateCredentials(credentials);
    const email = credentials.email.trim().toLowerCase();
    const existingUser = await getUserForAuthenticationService(email);
    if (existingUser) return sendError(res, 409, "User already registered");

    const user = await createUserService(email, await hashPassword(credentials.password));
    return sendJson(res, 201, { message: "Created User Successfully", user });
  } catch (error) {
    console.error("CREATE USER ERROR -", error);
    return sendError(res, error.statusCode ?? 500, error.statusCode ? error.message : "Internal Server Error");
  }
};

export const refreshToken = async (req, res) => {
  const refreshCookie = req.headers.cookie
    ?.split("; ")
    .find((cookie) => cookie.startsWith("hicappRefreshToken="));
  const refreshValue = refreshCookie?.slice("hicappRefreshToken=".length);
  const payload = refreshValue && readJWT(refreshValue);
  if (!payload?.userId) return sendError(res, 401, "Session expired");

  setSessionCookies(res, payload.userId);
  return sendJson(res, 200, { message: "Token refreshed" });
};

export const logoutUser = async (_req, res) => {
  const expired = "HttpOnly; Path=/; Max-Age=0; SameSite=Lax";
  res.setHeader("Set-Cookie", [
    `hicappAccessToken=; ${expired}`,
    `hicappRefreshToken=; ${expired}`,
  ]);
  return sendJson(res, 200, { message: "Logged out successfully" });
};
