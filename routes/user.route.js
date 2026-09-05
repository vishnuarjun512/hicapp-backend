import {
  editProfile,
  getProfileData,
  getUserById,
  getUsersController,
  registerUser,
  signInUser,
  togglePrivate,
} from "../controller/user.controller.js";
import { requireAuth, requireSameUser } from "../utils/jwt.js";

export function userRoutes(req, res) {
  if (req.method === "GET" && req.url === "/api/users") {
    if (!requireAuth(req, res)) return true;
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
    if (!requireAuth(req, res) || !requireSameUser(req, res, id)) return true;

    editProfile(req, res, id);
    return true;
  }

  if (req.method === "GET" && req.url.startsWith("/api/user/")) {
    const id = req.url.split("/").pop();
    if (!requireAuth(req, res)) return true;
    getUserById(req, res, id);
    return true;
  }

  if (req.method == "GET" && req.url.startsWith("/api/profile")) {
    const userId = req.url.split("/").pop();
    if (!requireAuth(req, res)) return true;
    getProfileData(req, res, userId);
    return true;
  }

  if (
    req.method == "PATCH" &&
    req.url.startsWith("/api/user/toggleIsPrivate/")
  ) {
    const userId = req.url.split("/").pop();
    if (!requireAuth(req, res) || !requireSameUser(req, res, userId)) return true;
    togglePrivate(req, res, userId);
    return true;
  }

  return false;
}
