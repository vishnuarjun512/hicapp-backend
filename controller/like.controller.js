import { requireAuthenticatedUser } from "../utils/jwt.js";
import {
  likePostService,
  unlikePostService,
} from "../services/like.service.js";
import { createNotificationService } from "../services/notification.service.js";
import { getPostByIdService } from "../services/post.service.js";
import pool from "../config/db.js";

export const likePostController = async (req, res, postId) => {
  const client = await pool.connect();
  try {
    const { userId } = requireAuthenticatedUser(req);

    await client.query("BEGIN");
    const post = await getPostByIdService(client, postId);

    if (!post) {
      await client.query("ROLLBACK");
      res.statusCode = 404;
      res.end(
        JSON.stringify({
          message: "Post not found",
        }),
      );
      return;
    }

    const like = await likePostService(client, postId, userId);

    if (post.author.id != userId) {
      await createNotificationService({
        client,
        recipientId: post.author.id,
        actorId: userId,
        type: "post_like",
        postId: postId,
        likeId: like.id,
      });
    }

    await client.query("COMMIT");
    res.statusCode = 201;
    res.end(JSON.stringify({ like, message: "Liked Post Successfully" }));
  } catch (error) {
    await client.query("ROLLBACK");
    console.log("LIKE POST CONTROLLER ERROR - ", error);
    res.statusCode = 500;
    res.end(
      JSON.stringify({
        message: "Internal Server Error",
      }),
    );
  }
};

export const unlikePostController = async (req, res, postId) => {
  try {
    const { userId } = requireAuthenticatedUser(req);

    const like = unlikePostService(postId, userId);

    res.statusCode = 201;
    res.end(JSON.stringify({ like, message: "UnLiked Post Successfully" }));
  } catch (error) {
    console.log("UNLIKE POST CONTROLLER ERROR - ", error);
    res.statusCode = 500;
    res.end(
      JSON.stringify({
        message: "Internal Server Error",
      }),
    );
  }
};
