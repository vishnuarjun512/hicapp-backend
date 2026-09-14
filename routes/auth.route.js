import {
  logoutUser,
  refreshToken,
  registerUser,
  signInUser,
} from "../controller/auth.controller.js";
import { getPathname } from "../utils/http.js";

export const authRoutes = (req, res) => {
  const pathname = getPathname(req);
  if (req.method == "POST" && pathname == "/api/auth/login") {
    signInUser(req, res);
    return true;
  }

  if (req.method == "POST" && pathname == "/api/auth/register") {
    registerUser(req, res);
    return true;
  }

  if (req.method == "POST" && pathname == "/api/auth/refresh") {
    refreshToken(req, res);
    return true;
  }

  if (req.method == "POST" && pathname == "/api/auth/logout") {
    logoutUser(req, res);
    return true;
  }

  return false;
};
