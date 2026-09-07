import {
  logoutUser,
  refreshToken,
  registerUser,
  signInUser,
} from "../controller/auth.controller.js";

export const authRoutes = (req, res) => {
  if (req.method == "POST" && req.url == "/api/auth/login") {
    signInUser(req, res);
    return true;
  }

  if (req.method == "POST" && req.url == "/api/auth/register") {
    registerUser(req, res);
    return true;
  }

  if (req.method == "POST" && req.url == "/api/auth/refresh") {
    refreshToken(req, res);
    return true;
  }

  if (req.method == "GET" && req.url == "/api/auth/logout") {
    logoutUser(req, res);
    return true;
  }

  return false;
};
