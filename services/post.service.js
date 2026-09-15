import pool from "../config/db.js";
import { createPostTableQuery } from "../query/create-tables.js";

export const createPostTableService = async () => {
  try {
    await pool.query(createPostTableQuery);

    console.log("✅ Post table created");
  } catch (error) {
    console.error("❌ CREATE POSTS TABLE ERROR - ", error);
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
            'profilePicUrl', u.profile_pic_url
          ) AS author,

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

          (
            SELECT l.reaction
            FROM likes l
            WHERE l.post_id = p.id
              AND l.user_id = $2
            LIMIT 1
          ) AS current_user_reaction

        FROM posts p

        JOIN users u
          ON p.user_id = u.id

        WHERE p.user_id = $1

        ORDER BY p.created_at DESC

        LIMIT $3
        OFFSET $4
    `;

    const posts = await pool.query(query, [
      userId,
      currentUserId,
      endIndex - startIndex,
      startIndex,
    ]);

    const formattedPosts = posts.rows.map((post) => ({
      ...post,
      likes: Number(post.like_count),
      comments: Number(post.comment_count),
    }));

    console.log(formattedPosts);
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
          'profilePicUrl', u.profile_pic_url
        ) AS author,

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

        (
          SELECT l.reaction
          FROM likes l
          WHERE l.post_id = p.id
            AND l.user_id = $1
          LIMIT 1
        ) AS current_user_reaction

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
      id: post.id,
      body: post.body,
      visibility: post.visibility,
      location: post.location,
      created_at: post.created_at,
      author: post.author,
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
