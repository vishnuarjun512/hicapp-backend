import {
  likePostController,
  unlikePostController,
} from "../controller/like.controller.js";

export const likeRoutes = (req, res) => {
  if (
    req.method == "GET" &&
    req.url.startsWith("/api/like") &&
    req.url.endsWith("/post")
  ) {
    const parts = req.url.split("/");
    const postId = parts[3];
    likePostController(req, res, postId);
    return true;
  }

  if (
    req.method == "GET" &&
    req.url.startsWith("/api/unlike") &&
    req.url.endsWith("/post")
  ) {
    const parts = req.url.split("/");
    const postId = parts[3];
    unlikePostController(req, res, postId);
    return true;
  }

  return false;
};
