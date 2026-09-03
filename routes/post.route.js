import { createPostController } from "../controller/post.controller.js";

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

  return false;
}
