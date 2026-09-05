import {
  acceptFollowRequest,
  followUser,
  getAllUsersFollowersFollowingFRSuggestedController,
  rejectFollowRequest,
  unfollowUser,
} from "../controller/follow.controller.js";
import { requireAuth, requireSameUser } from "../utils/jwt.js";

export const followRoutes = (req, res) => {
  // FOLLOW USER
  if (
    req.method === "POST" &&
    req.url.startsWith("/api/users/") &&
    req.url.endsWith("/follow")
  ) {
    if (!requireAuth(req, res)) return true;
    const parts = req.url.split("/");
    const receiver_id = parts[3];

    followUser(req, res, receiver_id);

    return true;
  }

  // UNFOLLOW USER
  if (
    req.method === "DELETE" &&
    req.url.startsWith("/api/users/") &&
    req.url.endsWith("/unfollow")
  ) {
    if (!requireAuth(req, res)) return true;
    const parts = req.url.split("/");
    const id = parts[3];

    unfollowUser(req, res, id);

    return true;
  }

  // ACCEPT FOLLOW REQUEST
  if (
    req.method === "POST" &&
    req.url.startsWith("/api/followrequest/") &&
    req.url.endsWith("/accept")
  ) {
    if (!requireAuth(req, res)) return true;
    const parts = req.url.split("/");
    const receiver_id = parts[3];

    acceptFollowRequest(req, res, receiver_id);

    return true;
  }

  // REJECT FOLLOW REQUEST
  if (
    req.method === "POST" &&
    req.url.startsWith("/api/followrequest/") &&
    req.url.endsWith("/reject")
  ) {
    if (!requireAuth(req, res)) return true;
    const parts = req.url.split("/");
    const id = parts[3];

    rejectFollowRequest(req, res, id);

    return true;
  }

  // GET ALL USERS FOR FRIENDS PAGE
  if (req.method == "GET" && req.url.startsWith("/api/friends")) {
    if (!requireAuth(req, res)) return true;
    const userId =
      req.url === "/api/friends" ? req.auth.userId : req.url.split("/").pop();
    if (!requireSameUser(req, res, userId)) return true;
    getAllUsersFollowersFollowingFRSuggestedController(req, res, userId);
    return true;
  }

  return false;
};
