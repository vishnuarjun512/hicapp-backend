import { requireAuthenticatedUser } from "../utils/jwt.js";
import {
  likePostService,
  unlikePostService,
} from "../services/like.service.js";

export const likePostController = async (req, res, postId) => {
  try {
    const { userId } = requireAuthenticatedUser(req);

    const like = await likePostService(postId, userId);
    res.statusCode = 201;
    res.end(JSON.stringify({ like, message: "Liked Post Successfully" }));
  } catch (error) {
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
