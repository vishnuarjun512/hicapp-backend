import jwt from "jsonwebtoken";

export const readJWT = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const getTokenFromCookie = (req) => {
  const cookies = req.headers.cookie;

  if (!cookies) {
    return null;
  }

  const cookie = cookies
    .split("; ")
    .find((cookie) => cookie.startsWith("hicappAccessToken="));

  if (!cookie) {
    return null;
  }

  return cookie.slice("hicappAccessToken=".length);
};

export const verifyToken = (req) => {
  const token = getTokenFromCookie(req);

  if (!token) {
    return null;
  }

  return readJWT(token);
};
