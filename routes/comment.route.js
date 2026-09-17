import {
  createComment,
  deleteComment,
  getCommentsByPostID,
  updateComment,
} from "../controller/comment.controller.js";

export const commentRoutes = (req, res) => {
  if (req.method == "GET" && req.url.startsWith("/api/comment")) {
    const postID = req.url.split("/").pop();
    getCommentsByPostID(req, res, postID);
    return true;
  }

  if (req.method == "POST" && req.url.startsWith("/api/comment")) {
    const postID = req.url.split("/").pop();
    createComment(req, res, postID);
    return true;
  }

  if (req.method == "DELETE" && req.url.startsWith("/api/comment")) {
    const commentID = req.url.split("/").pop();
    deleteComment(req, res, commentID);
    return true;
  }

  if (req.method == "PATCH" && req.url.startsWith("/api/comment")) {
    const commentID = req.url.split("/").pop();
    updateComment(req, res, commentID);
    return true;
  }

  return false;
};
