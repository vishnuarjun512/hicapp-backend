import {
  createPostController,
  deletePostByIdController,
} from "../controller/post.controller.js";

export function postRoutes(req, res) {
  if (req.method == "GET" && req.url.startsWith("/api/post/")) {
    const userId = req.url.split("/").pop();
    getPostsControllerByUserID(req, res, userId);
    return true;
  }

  if (req.method == "POST" && req.url.startsWith("/api/post/")) {
    const userId = req.url.split("/").pop();
    createPostController(req, res, userId);
    return true;
  }

  if (req.method == "DELETE" && req.url.startsWith("/api/post/")) {
    const postId = req.url.split("/").pop();
    deletePostByIdController(req, res, postId);
    return true;
  }

  return false;
}
