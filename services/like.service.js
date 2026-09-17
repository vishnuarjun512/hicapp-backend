import pool from "../config/db.js";

export const likePostService = async (postId, userId, reaction = "like") => {
  try {
    const query = `
    INSERT INTO likes
    (post_id,user_id,reaction)
    VALUES ($1, $2, $3)
    RETURNING *
    `;

    const result = await pool.query(query, [postId, userId, reaction]);
    return result.rows[0];
  } catch (error) {
    console.log("LIKE POST SERVICE ERROR - ", error);
    throw error;
  }
};

export const unlikePostService = async (postId, userId) => {
  try {
    const query = `
    DELETE FROM likes
    WHERE post_id=$1 AND user_id=$2
    RETURNING id;
    `;

    const result = await pool.query(query, [postId, userId]);
    return result.rows[0];
  } catch (error) {
    console.log("UNLIKE POST SERVICE ERROR - ", error);
    throw error;
  }
};
