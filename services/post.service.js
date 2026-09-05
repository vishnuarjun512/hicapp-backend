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
        SELECT * FROM posts 
        WHERE id=$1 
        RETURNING 
          id, user_id, body, visibility, location, created_at, updated_at  
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
      SELECT p.id, p.body, p.visibility, p.location, p.created_at,
        json_build_object(
          'id', u.id,
          'name', u.name,
          'handle', u.handle,
          'profilePicUrl', u.profile_pic_url
        ) AS author
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.user_id = $1
      ORDER BY p.created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const posts = await pool.query(query, [
      userId,
      endIndex - startIndex,
      startIndex,
    ]);

    return posts.rows;
  } catch (error) {
    console.log("GET POSTS BY USER ID SERVICE ERROR - ", error);
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
