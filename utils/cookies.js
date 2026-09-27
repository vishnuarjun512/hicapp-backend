import { createToken } from "./jwt.js";

const ACCESS_TOKEN_MAX_AGE_IN_MINUTES = 10;
const REFRESH_TOKEN_MAX_AGE_IN_MINUTES = 20;
const ACCESS_TOKEN_MAX_AGE = ACCESS_TOKEN_MAX_AGE_IN_MINUTES * 60;
const REFRESH_TOKEN_MAX_AGE = REFRESH_TOKEN_MAX_AGE_IN_MINUTES * 60;

export const setSessionCookies = (res, userId) => {
  const accessToken = createToken(
    userId,
    `${ACCESS_TOKEN_MAX_AGE_IN_MINUTES}m`,
  );
  const refreshToken = createToken(
    userId,
    `${REFRESH_TOKEN_MAX_AGE_IN_MINUTES}m`,
  );

  res.setHeader("Set-Cookie", [
    `hicappAccessToken=${accessToken}; ${cookieOptions(ACCESS_TOKEN_MAX_AGE)}`,
    `hicappRefreshToken=${refreshToken}; ${cookieOptions(REFRESH_TOKEN_MAX_AGE)}`,
  ]);

  return {
    accessToken,
    refreshToken,
    accessTokenDuration: ACCESS_TOKEN_MAX_AGE,
    refreshTokenDuration: REFRESH_TOKEN_MAX_AGE,
  };
};

export const cookieOptions = (maxAge) => {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `HttpOnly; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`;
};
