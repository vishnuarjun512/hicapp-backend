import jwt from "jsonwebtoken";

export const readJWT = (token) => {
  try {
    const data = jwt.verify(token, process.env.JWT_SECRET);
    return data;
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
    .find((cookie) => cookie.startsWith("hicappToken="));

  if (!cookie) {
    return null;
  }

  return cookie.slice("hicappToken=".length);
};

export const verifyToken = (req) => {
  const token = getTokenFromCookie(req);

  if (!token) {
    return null;
  }

  return readJWT(token);
};
