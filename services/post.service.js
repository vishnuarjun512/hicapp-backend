import pool from "../config/db.js";
import {
  createPostImagesTableQuery,
  createPostTableQuery,
} from "../query/create-tables.js";
import { getImageUploadURL } from "../utils/aws-s3.js";

export const createPostTableService = async () => {
  try {
    await pool.query(createPostTableQuery);

    console.log("✅ Post table created");
  } catch (error) {
    console.error("❌ CREATE POSTS TABLE ERROR - ", error);
    throw error;
  }
};

export const createPostImagesTableService = async () => {
  try {
    await pool.query(createPostImagesTableQuery);

    console.log("✅ Post Images table created");
  } catch (error) {
    console.error("❌ CREATE POSTS IMAGES TABLE ERROR - ", error);
    throw error;
  }
};

export const getPostByIdService = async (postId) => {
  try {
    const query = `
        SELECT id, user_id, body, visibility, location, created_at, updated_at
        FROM posts
        WHERE id=$1
      `;

    const post = await pool.query(query, [postId]);
    return post.rows[0];
  } catch (error) {
    console.log("DELETE POST BY ID ERROR - ", error);
    throw error;
  }
};

export const getPostsByUserIdService = async (
  userId,
  startIndex = 0,
  endIndex = 5,
) => {
  try {
    const query = `
        SELECT
          p.id,
          p.body,
          p.visibility,
          p.location,
          p.created_at,

          json_build_object(
            'id', u.id,
            'name', u.name,
            'handle', u.handle,
            'profile_pic_url', u.profile_pic_url
          ) AS author,

          (
            SELECT COALESCE(
              json_agg(
                json_build_object(
                  'id', pi.id,
                  'url', pi.image_url,
                  'position', pi.position
                )
                ORDER BY pi.position
              ),
              '[]'::json
            )
            FROM post_images pi
            WHERE pi.post_id = p.id
          ) AS images,

          (
            SELECT COUNT(*)
            FROM likes l
            WHERE l.post_id = p.id
          ) AS like_count,

          (
            SELECT COUNT(*)
            FROM comments c
            WHERE c.post_id = p.id
          ) AS comment_count,

          EXISTS (
            SELECT 1
            FROM likes l
            WHERE l.post_id = p.id
              AND l.user_id = $1
          ) AS liked

        FROM posts p

        JOIN users u
          ON p.user_id = u.id

        WHERE p.user_id = $1

        ORDER BY p.created_at DESC

        LIMIT $2
        OFFSET $3
    `;

    const posts = await pool.query(query, [
      userId,
      endIndex - startIndex,
      startIndex,
    ]);

    const formattedPosts = posts.rows.map((post) => ({
      ...post,
      likes: Number(post.like_count),
      comments: Number(post.comment_count),
    }));

    return formattedPosts;
  } catch (error) {
    console.log("GET POSTS BY USER ID SERVICE ERROR - ", error);
    throw error;
  }
};

export const getFeedPostsService = async (
  currentUserId,
  startIndex = 0,
  endIndex = 5,
) => {
  try {
    const query = `
      SELECT
        p.id,
        p.body,
        p.visibility,
        p.location,
        p.created_at,

        json_build_object(
          'id', u.id,
          'name', u.name,
          'handle', u.handle,
          'profile_pic_url', u.profile_pic_url
        ) AS author,

        (
          SELECT COALESCE(
            json_agg(
              json_build_object(
                'id', pi.id,
                'url', pi.image_url,
                'position', pi.position
              )
              ORDER BY pi.position
            ),
            '[]'::json
          )
          FROM post_images pi
          WHERE pi.post_id = p.id
        ) AS images,

        (
          SELECT COUNT(*)
          FROM likes l
          WHERE l.post_id = p.id
        ) AS like_count,

        (
          SELECT COUNT(*)
          FROM comments c
          WHERE c.post_id = p.id
        ) AS comment_count,

        EXISTS (
          SELECT 1
          FROM likes l
          WHERE l.post_id = p.id
            AND l.user_id = $1
        ) AS liked

      FROM posts p

      JOIN users u
        ON p.user_id = u.id

      WHERE p.user_id = $1

      OR EXISTS (
        SELECT 1
        FROM follow f
        WHERE f.follower_id = $1
          AND f.following_id = p.user_id
      )

      ORDER BY p.created_at DESC

      LIMIT $2
      OFFSET $3
    `;

    const result = await pool.query(query, [
      currentUserId,
      endIndex - startIndex,
      startIndex,
    ]);

    const posts = result.rows.map((post) => ({
      ...post,
      likes: Number(post.like_count),
      comments: Number(post.comment_count),
      currentUserReaction: post.current_user_reaction,
    }));

    return posts;
  } catch (error) {
    console.log("GET FEED POSTS SERVICE ERROR - ", error);
    throw error;
  }
};

export const createPostService = async (
  userid,
  content,
  visbility = "public",
  location,
) => {
  try {
    const query = `
    INSERT INTO posts 
    (user_id, body, visibility, location)
    VALUES ($1, $2, $3, $4)
    RETURNING id
    `;

    const post = await pool.query(query, [
      userid,
      content,
      visbility,
      location,
    ]);
    return post.rows[0];
  } catch (error) {
    console.log("CREATE POST SERVICE ERROR - ", error);
    throw error;
  }
};

export const deletePostByIdService = async (id, userId) => {
  try {
    const query = `DELETE FROM posts WHERE id=$1 AND user_id=$2 RETURNING *`;
    const result = await pool.query(query, [id, userId]);
    return result.rows[0];
  } catch (error) {
    console.log("DELETE POST SERVICE ERROR - ", error);
    throw error;
  }
};

export const createPostImageUploadURLsService = async (
  userId,
  postId,
  images,
) => {
  const bucket = process.env.AWS_BUCKET_NAME;

  const uploadImages = await Promise.all(
    images.map(async (image) => {
      const { contentType, position } = image;

      const extension = contentType.split("/")[1];

      const key = `${userId}/posts/${postId}/im${position}.${extension}`;

      const uploadUrl = await getImageUploadURL(bucket, key, contentType, 60);

      const fileUrl = `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

      return {
        position,
        uploadUrl,
        fileUrl,
      };
    }),
  );

  return uploadImages;
};

export const createPostImagesService = async (userId, postId, images) => {
  const values = [];
  const placeholders = [];

  let parameterIndex = 1;

  for (const image of images) {
    placeholders.push(
      `($${parameterIndex}, $${parameterIndex + 1}, $${parameterIndex + 2}, $${parameterIndex + 3})`,
    );

    values.push(postId, userId, image.url, image.position);

    parameterIndex += 4;
  }

  const query = `
    INSERT INTO post_images (
      post_id,
      user_id,
      image_url,
      position
    )
    VALUES ${placeholders.join(", ")}
    RETURNING id, post_id, image_url, position;
  `;

  const result = await pool.query(query, values);

  return result.rows;
};

export const getPostOwnershipService = async (postId, userId) => {
  const query = `
    SELECT id
    FROM posts
    WHERE id = $1
      AND user_id = $2
  `;

  const result = await pool.query(query, [postId, userId]);

  return result.rows[0];
};
