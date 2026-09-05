import { createHmac, timingSafeEqual } from "node:crypto";

const algorithm = "HS256";
const tokenLifetimeSeconds = 60 * 60 * 24 * 7;

const base64UrlEncode = (value) =>
  Buffer.from(typeof value === "string" ? value : JSON.stringify(value)).toString(
    "base64url",
  );

const base64UrlDecode = (value) =>
  JSON.parse(Buffer.from(value, "base64url").toString("utf8"));

const getSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  return process.env.JWT_SECRET;
};

const sign = (value) =>
  createHmac("sha256", getSecret()).update(value).digest("base64url");

export const createAccessToken = (user) => {
  const now = Math.floor(Date.now() / 1000);
  const header = base64UrlEncode({ alg: algorithm, typ: "JWT" });
  const payload = base64UrlEncode({
    sub: user.id,
    email: user.email,
    iat: now,
    exp: now + tokenLifetimeSeconds,
  });
  const unsignedToken = `${header}.${payload}`;

  return `${unsignedToken}.${sign(unsignedToken)}`;
};

const verifyAccessToken = (token) => {
  const [encodedHeader, encodedPayload, signature] = token.split(".");

  if (!encodedHeader || !encodedPayload || !signature) {
    throw new Error("Malformed token");
  }

  const header = base64UrlDecode(encodedHeader);
  if (header.alg !== algorithm || header.typ !== "JWT") {
    throw new Error("Unsupported token");
  }

  const expectedSignature = sign(`${encodedHeader}.${encodedPayload}`);
  const supplied = Buffer.from(signature);
  const expected = Buffer.from(expectedSignature);

  if (
    supplied.length !== expected.length ||
    !timingSafeEqual(supplied, expected)
  ) {
    throw new Error("Invalid token signature");
  }

  const payload = base64UrlDecode(encodedPayload);
  if (!payload.sub || !payload.exp || payload.exp <= Math.floor(Date.now() / 1000)) {
    throw new Error("Expired token");
  }

  return payload;
};

export const requireAuth = (req, res) => {
  const authorization = req.headers.authorization;
  const token = authorization?.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length)
    : null;

  if (!token) {
    res.statusCode = 401;
    res.end(JSON.stringify({ message: "Bearer token is required" }));
    return false;
  }

  try {
    const payload = verifyAccessToken(token);
    req.auth = { userId: payload.sub, email: payload.email };
    return true;
  } catch (error) {
    res.statusCode = 401;
    res.end(JSON.stringify({ message: "Invalid or expired access token" }));
    return false;
  }
};

export const requireSameUser = (req, res, userId) => {
  if (req.auth.userId === userId) {
    return true;
  }

  res.statusCode = 403;
  res.end(JSON.stringify({ message: "You are not allowed to act as this user" }));
  return false;
};
