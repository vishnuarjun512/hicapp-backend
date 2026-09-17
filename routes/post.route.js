import {
  createPostController,
  createPostImagesController,
  getPostImageURLS,
  deletePostByIdController,
  getPostsControllerByUserID,
} from "../controller/post.controller.js";

export function postRoutes(req, res) {
  if (req.method == "POST" && req.url.startsWith("/api/post/get-image-urls")) {
    getPostImageURLS(req, res);
    return true;
  }

  if (
    req.method === "POST" &&
    req.url.startsWith("/api/post/upload-image-urls")
  ) {
    createPostImagesController(req, res);
    return true;
  }

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
