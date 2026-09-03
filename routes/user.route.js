import {
  editProfile,
  getUserById,
  getUsersController,
  registerUser,
  signInUser,
  togglePrivate,
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

  if (req.method === "PUT" && req.url.startsWith("/api/user/edit-profile/")) {
    const id = req.url.split("/").pop();

    editProfile(req, res, id);
    return true;
  }

  if (req.method === "GET" && req.url.startsWith("/api/user/")) {
    const id = req.url.split("/").pop();
    getUserById(req, res, id);
    return true;
  }

  if (
    req.method == "PATCH" &&
    req.url.startsWith("/api/user/toggleIsPrivate/")
  ) {
    const userId = req.url.split("/").pop();
    togglePrivate(req, res, userId);
    return true;
  }

  return false;
}
