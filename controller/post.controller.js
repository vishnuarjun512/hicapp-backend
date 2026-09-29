import {
  createPostImagesService,
  createPostImageUploadURLsService,
  createPostService,
  deletePostByIdService,
  getPostByIdService,
  getPostsByUserIdService,
} from "../services/post.service.js";
import { BodyReader } from "../utils/dataReader.js";
import { URL } from "node:url";
import { requireAuthenticatedUser } from "../utils/jwt.js";
import { deleteS3Object, getS3KeyFromUrl } from "../utils/aws-s3.js";
import pool from "../config/db.js";
import { sendError, sendJson } from "../utils/http.js";

export const createPostController = async (req, res, userId) => {
  const client = await pool.connect();
  try {
    const authenticatedUser = requireAuthenticatedUser(req);

    if (authenticatedUser.userId !== userId) {
      res.statusCode = 403;
      res.end(
        JSON.stringify({ message: "You can only create posts for yourself" }),
      );
      return;
    }

    const data = await BodyReader(req);

    const { body, visibility, location } = data;
    if (typeof body !== "string" || !body.trim()) {
      res.statusCode = 400;
      res.end(JSON.stringify({ message: "Post body is required" }));
      return;
    }

    const { id } = await createPostService(
      userId,
      body.trim(),
      visibility,
      location,
    );

    const post = await getPostByIdService(client, id);

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
    requireAuthenticatedUser(req);
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
  const client = await pool.connect();
  try {
    const { userId } = requireAuthenticatedUser(req);

    // -----------------------------------
    // 1. Get post
    // -----------------------------------

    const post = await getPostByIdService(client, id);

    if (!post) {
      const message = "Post not found";
      sendError(res, 404, message);
      return;
    }

    // -----------------------------------
    // 2. Make sure user owns the post
    // -----------------------------------

    if (post.author.id !== userId) {
      const message = "You can only delete your own posts";
      sendError(res, 403, message);
      return;
    }

    // -----------------------------------
    // 3. Delete images from S3
    // -----------------------------------

    if (post.images.length > 0) {
      // delete images from S3
      await Promise.all(
        post.images.map((image) => {
          const key = getS3KeyFromUrl(image.url);

          return deleteS3Object(process.env.AWS_BUCKET_NAME, key);
        }),
      );
    }

    // -----------------------------------
    // 4. Delete post from database
    // -----------------------------------

    await deletePostByIdService(id, userId);

    // post_images rows are automatically
    // deleted because of ON DELETE CASCADE

    // -----------------------------------
    // 5. Response
    // -----------------------------------

    sendJson(res, 200, { message: "Post Deleted" });
  } catch (error) {
    console.log("DELETE POST BY ID CONTROLLER ERROR - ", error);
    sendError(
      res,
      error.statusCode ?? 500,
      error.message ?? "Internal Server Error",
    );
  }
};

export const getPostImageURLS = async (req, res) => {
  try {
    const { userId } = requireAuthenticatedUser(req);

    const data = await BodyReader(req);

    const { postId, images } = data;
    console.log("PostID, images", postId, images);

    // -----------------------------
    // Validate postId
    // -----------------------------

    if (!postId) {
      res.statusCode = 400;
      res.end(
        JSON.stringify({
          message: "postId is required",
        }),
      );
      return;
    }

    // -----------------------------
    // Validate images
    // -----------------------------

    if (!Array.isArray(images) || images.length === 0) {
      res.statusCode = 400;
      res.end(
        JSON.stringify({
          message: "images are required",
        }),
      );
      return;
    }

    if (images.length > 10) {
      res.statusCode = 400;
      res.end(
        JSON.stringify({
          message: "Maximum 10 images allowed",
        }),
      );
      return;
    }

    // -----------------------------
    // Validate each image
    // -----------------------------

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/avif",
    ];

    for (const image of images) {
      if (!allowedTypes.includes(image.contentType)) {
        res.statusCode = 400;
        res.end(
          JSON.stringify({
            message: `Unsupported image type: ${image.contentType}`,
          }),
        );
        return;
      }

      if (
        !Number.isInteger(image.position) ||
        image.position < 1 ||
        image.position > 10
      ) {
        res.statusCode = 400;
        res.end(
          JSON.stringify({
            message: "Invalid image position",
          }),
        );
        return;
      }
    }

    // -----------------------------
    // Generate upload URLs
    // -----------------------------

    const uploadImages = await createPostImageUploadURLsService(
      userId,
      postId,
      images,
    );

    res.statusCode = 200;

    res.end(
      JSON.stringify({
        images: uploadImages,
      }),
    );
  } catch (error) {
    console.error("CREATE POST IMAGE UPLOAD URL CONTROLLER ERROR:", error);

    res.statusCode = 500;

    res.end(
      JSON.stringify({
        message: "Internal Server Error",
      }),
    );
  }
};

export const createPostImagesController = async (req, res) => {
  try {
    const { userId } = requireAuthenticatedUser(req);

    const data = await BodyReader(req);

    const { images, postId } = data;

    if (!postId) {
      res.statusCode = 400;
      res.end(
        JSON.stringify({
          message: "postId is required",
        }),
      );
      return;
    }

    if (!Array.isArray(images) || images.length === 0) {
      res.statusCode = 400;
      res.end(
        JSON.stringify({
          message: "images are required",
        }),
      );
      return;
    }

    if (images.length > 10) {
      res.statusCode = 400;
      res.end(
        JSON.stringify({
          message: "Maximum 10 images allowed",
        }),
      );
      return;
    }

    const savedImages = await createPostImagesService(userId, postId, images);

    res.statusCode = 201;

    res.end(
      JSON.stringify({
        message: "Post images saved successfully",
        images: savedImages,
      }),
    );
  } catch (error) {
    console.error("CREATE POST IMAGES CONTROLLER ERROR:", error);

    res.statusCode = 500;

    res.end(
      JSON.stringify({
        message: "Internal Server Error",
      }),
    );
  }
};
