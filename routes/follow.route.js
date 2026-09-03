import {
  acceptFollowRequest,
  followUser,
  getAllUsersFollowersFollowingFRSuggestedController,
  getSuggestedUsers,
  rejectFollowRequest,
  unfollowUser,
} from "../controller/follow.controller.js";
import {
  getFollowersService,
  getFollowingService,
} from "../services/follow.service.js";

export const followRoutes = (req, res) => {
  // FOLLOW USER
  if (
    req.method === "POST" &&
    req.url.startsWith("/api/users/") &&
    req.url.endsWith("/follow")
  ) {
    const parts = req.url.split("/");
    const id = parts[3];

    followUser(req, res, id);

    return true;
  }

  // UNFOLLOW USER
  if (
    req.method === "DELETE" &&
    req.url.startsWith("/api/users/") &&
    req.url.endsWith("/follow")
  ) {
    const parts = req.url.split("/");
    const id = parts[3];

    unfollowUser(req, res, id);

    return true;
  }

  // ACCEPT FOLLOW REQUEST
  if (
    req.method === "POST" &&
    req.url.startsWith("/api/follow-requests/") &&
    req.url.endsWith("/accept")
  ) {
    const parts = req.url.split("/");
    const id = parts[3];

    acceptFollowRequest(req, res, id);

    return true;
  }

  // REJECT FOLLOW REQUEST
  if (
    req.method === "POST" &&
    req.url.startsWith("/api/follow-requests/") &&
    req.url.endsWith("/reject")
  ) {
    const parts = req.url.split("/");
    const id = parts[3];

    rejectFollowRequest(req, res, id);

    return true;
  }

  // GET FOLLOWERS
  if (
    req.method === "GET" &&
    req.url.startsWith("/api/users/") &&
    req.url.endsWith("/followers")
  ) {
    const parts = req.url.split("/");
    const id = parts[3];

    getFollowersService(req, res, id);

    return true;
  }

  // GET FOLLOWING
  if (
    req.method === "GET" &&
    req.url.startsWith("/api/users/") &&
    req.url.endsWith("/following")
  ) {
    const parts = req.url.split("/");
    const id = parts[3];

    getFollowingService(req, res, id);

    return true;
  }

  // SUGGESTED
  if (req.method == "GET" && req.url.startsWith("/api/users/suggestions")) {
    const userId = req.url.split("/").pop();
    getSuggestedUsers(req, res, userId);
    return true;
  }

  // GET ALL
  if (req.method == "GET" && req.url.startsWith("/api/friends")) {
    const userId = req.url.split("/").pop();
    getAllUsersFollowersFollowingFRSuggestedController(req, res, userId);
    return true;
  }

  return false;
};
