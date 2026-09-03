import {
  acceptFollowRequest,
  followUser,
  getAllUsersFollowersFollowingFRSuggestedController,
  rejectFollowRequest,
  unfollowUser,
} from "../controller/follow.controller.js";

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
    req.url.endsWith("/unfollow")
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

  // GET ALL USERS FOR FRIENDS PAGE
  if (req.method == "GET" && req.url.startsWith("/api/friends")) {
    const userId = req.url.split("/").pop();
    getAllUsersFollowersFollowingFRSuggestedController(req, res, userId);
    return true;
  }

  return false;
};
