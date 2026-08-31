import {
  getUsersController,
  createUser,
} from "../controller/user.controller.js";

export function userRoutes(req, res) {
  if (req.method === "GET" && req.url === "/api/users") {
    getUsersController(req, res);
    return true;
  }

  if (req.method === "POST" && req.url === "/api/auth/register") {
    createUser(req, res);
    return true;
  }

  return false;
}
