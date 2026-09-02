import {
  getUsersController,
  registerUser,
  signInUser,
} from "../controller/user.controller.js";

export function userRoutes(req, res) {
  if (req.method === "GET" && req.url === "/api/users") {
    getUsersController(req, res);
    return true;
  }

  if (req.method === "POST" && req.url === "/api/auth/register") {
    registerUser(req, res);
    return true;
  }

  if (req.method === "POST" && req.url === "/api/auth/login") {
    signInUser(req, res);
    return true;
  }

  return false;
}
