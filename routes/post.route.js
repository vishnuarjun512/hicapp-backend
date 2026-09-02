import { createPostController } from "../controller/post.controller.js";
export function postRoutes(req, res) {
  if (req.url == "POST" && req.url.startsWith("/api/post")) {
    const userId = req.url.split("/").pop();
    createPostController(req, res, userId);
    return true;
  }
  return false;
}
