import {
  createPostController,
  deletePostByIdController,
  getPostsControllerByUserID,
} from "../controller/post.controller.js";
import { requireAuth } from "../utils/jwt.js";

export function postRoutes(req, res) {
  if (req.method == "GET" && req.url.startsWith("/api/post/")) {
    if (!requireAuth(req, res)) return true;
    const userId = new URL(req.url, "http://localhost").pathname.split("/").pop();
    getPostsControllerByUserID(req, res, userId);
    return true;
  }

  if (req.method == "POST" && req.url.startsWith("/api/post/")) {
    if (!requireAuth(req, res)) return true;
    const userId = req.auth.userId;
    createPostController(req, res, userId);
    return true;
  }

  if (req.method == "DELETE" && req.url.startsWith("/api/post/")) {
    if (!requireAuth(req, res)) return true;
    const postId = req.url.split("/").pop();
    deletePostByIdController(req, res, postId, req.auth.userId);
    return true;
  }

  return false;
}
