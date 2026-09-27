import { requireAuthenticatedUser } from "../utils/jwt.js";
import {
  getCommentsByPostIDService,
  createCommentService,
  getCommentByIDService,
  deleteCommentByIDService,
  updateCommentService,
} from "../services/comment.service.js";
import { BodyReader } from "../utils/dataReader.js";
import { getPostByIdService } from "../services/post.service.js";
import { createNotificationService } from "../services/notification.service.js";

export const getCommentsByPostID = async (req, res, postID) => {
  try {
    requireAuthenticatedUser(req);

    const comments = await getCommentsByPostIDService(postID);
    res.statusCode = 200;
    res.end(
      JSON.stringify({ comments, message: "Comments Retrieved Successfully" }),
    );
  } catch (error) {
    console.log("COMMENTS GET CONTROLLER ERROR - ", error);
    res.statusCode = 500;
    res.end(
      JSON.stringify({
        message: "Internal Server Error",
      }),
    );
    return;
  }
};

export const createComment = async (req, res, postID) => {
  try {
    const { userId } = requireAuthenticatedUser(req);
    const { body } = await BodyReader(req);
    const { id } = await createCommentService(postID, userId, body);

    const post = await getPostByIdService(postID);

    if (!post) {
      res.statusCode = 404;
      res.end(
        JSON.stringify({
          message: "Post not found",
        }),
      );
    }

    const newComment = await getCommentByIDService(id);

    if (post.author.id != userId) {
      await createNotificationService({
        recipientId: post.author.id,
        actorId: userId,
        type: "post_comment",
        postId: postID,
        commentId: newComment.id,
      });
    }

    res.statusCode = 201;
    res.end(
      JSON.stringify({ newComment, message: "Comment Created Successfully" }),
    );
  } catch (error) {
    console.log("COMMENTS POST CONTROLLER ERROR - ", error);
    res.statusCode = 500;
    res.end(
      JSON.stringify({
        message: "Internal Server Error",
      }),
    );
    return;
  }
};

export const deleteComment = async (req, res, commentID) => {
  try {
    requireAuthenticatedUser(req);

    const comment = await getCommentByIDService(commentID);

    if (!comment) {
      res.statusCode = 404;
      res.end(JSON.stringify({ message: "Comment not found" }));
      return;
    }

    const { id } = await deleteCommentByIDService(commentID);

    res.statusCode = 201;
    res.end(
      JSON.stringify({
        deletedCommentID: id,
        message: "Comment Deleted Successfully",
      }),
    );
  } catch (error) {
    console.log("COMMENTS DELETE CONTROLLER ERROR - ", error);
    res.statusCode = 500;
    res.end(
      JSON.stringify({
        message: "Internal Server Error",
      }),
    );
    return;
  }
};

export const updateComment = async (req, res, commentID) => {
  try {
    requireAuthenticatedUser(req);

    const comment = await getCommentByIDService(commentID);

    if (!comment) {
      res.statusCode = 404;
      res.end(JSON.stringify({ message: "Comment not found" }));
      return;
    }

    const { updatedText } = await BodyReader(req);

    const { id } = await updateCommentService(commentID, updatedText);

    const updatedComment = await getCommentByIDService(id);

    res.statusCode = 201;
    res.end(
      JSON.stringify({
        updatedComment,
        message: "Comment updated Successfully",
      }),
    );
  } catch (error) {
    console.log("COMMENTS PATCH CONTROLLER ERROR - ", error);
    res.statusCode = 500;
    res.end(
      JSON.stringify({
        message: "Internal Server Error",
      }),
    );
    return;
  }
};
