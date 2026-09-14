import {
  createPostService,
  deletePostByIdService,
  getPostsByUserIdService,
} from "../services/post.service.js";
import { BodyReader } from "../utils/dataReader.js";
import { URL } from "node:url";
import { requireAuthenticatedUser } from "../utils/jwt.js";

export const createPostController = async (req, res, userId) => {
  try {
    const authenticatedUser = requireAuthenticatedUser(req);
    if (authenticatedUser.userId !== userId) {
      res.statusCode = 403;
      res.end(JSON.stringify({ message: "You can only create posts for yourself" }));
      return;
    }
    const data = await BodyReader(req);
    const { body, visibility, location } = data;
    if (typeof body !== "string" || !body.trim()) {
      res.statusCode = 400;
      res.end(JSON.stringify({ message: "Post body is required" }));
      return;
    }
    const post = await createPostService(userId, body.trim(), visibility, location);
    res.statusCode = 201;
    res.end(JSON.stringify({ message: "Post Created Successfully", post }));
  } catch (error) {
    console.log("CREATE POST CONTROLLER ERROR - ", error);
    res.statusCode = 500;
    res.end(
      JSON.stringify({
        message: "Internal Server Error",
      }),
    );
  }
};

export const getPostsControllerByUserID = async (req, res, userId) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const page = parseInt(url.searchParams.get("page")) || 1;
    const limit = parseInt(url.searchParams.get("limit")) || 5;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const posts = await getPostsByUserIdService(userId, startIndex, endIndex);
    res.statusCode = 200;
    res.end(
      JSON.stringify({
        posts,
      }),
    );
  } catch (error) {
    console.log("GET POSTS BY USER ID CONTROLLER ERROR - ", error);
    res.statusCode = 500;
    res.end(
      JSON.stringify({
        message: "Internal Server Error",
      }),
    );
  }
};

export const deletePostByIdController = async (req, res, id) => {
  try {
    const { userId } = requireAuthenticatedUser(req);
    const post = await deletePostByIdService(id, userId);
    if (!post) {
      res.statusCode = 404;
      res.end(JSON.stringify({ message: "Post not found" }));
      return;
    }

    res.statusCode = 200;

    console.log("Post Deleted");

    res.end(
      JSON.stringify({
        message: "Post Deleted",
      }),
    );
  } catch (error) {
    console.log("DELETE POST BY ID CONTROLLER ERROR - ", error);
    res.statusCode = 500;
    res.end(
      JSON.stringify({
        message: "Internal Server Error",
      }),
    );
  }
};
