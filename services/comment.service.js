import pool from "../config/db.js";

export const getCommentsByPostIDService = async (
  postID,
  startIndex = 0,
  endIndex = 5,
) => {
  try {
    const query = `
        SELECT 
          c.*,
          json_build_object(
            'id',u.id,
            'name',u.name,
            'handle', u.handle,
            'profilePicUrl', u.profile_pic_url 
          ) AS author
        FROM comments c
        JOIN users u ON c.user_id = u.id
        WHERE post_id = $1
        LIMIT $2 OFFSET $3
    `;
    const result = await pool.query(query, [
      postID,
      endIndex - startIndex,
      startIndex,
    ]);
    return result.rows;
  } catch (error) {
    console.log("COMMENTS BY ID GET SERVICE ERROR - ", error);
    throw error;
  }
};

export const getCommentByIDService = async (commentId) => {
  try {
    const query = `
        SELECT 
          c.*,
          json_build_object(
            'id',u.id,
            'name',u.name,
            'handle', u.handle,
            'profilePicUrl', u.profile_pic_url 
          ) AS author
        FROM comments c
        JOIN users u ON c.user_id = u.id
        WHERE c.id = $1
    `;

    const result = await pool.query(query, [commentId]);
    return result.rows[0];
  } catch (error) {
    console.log("COMMENTS BY ID GET SERVICE ERROR - ", error);
    throw error;
  }
};

export const createCommentService = async (postID, userId, body) => {
  try {
    const query = `
      INSERT INTO comments
      (post_id, user_id, comment)
      VALUES ($1, $2, $3)
      RETURNING id
    `;

    const result = await pool.query(query, [postID, userId, body]);
    return result.rows[0];
  } catch (error) {
    console.log("COMMENTS BY ID GET SERVICE ERROR - ", error);
    throw error;
  }
};

export const deleteCommentByIDService = async (commentId) => {
  try {
    const query = `
        DELETE FROM comments
        WHERE id = $1
        RETURNING id;
    `;
    const result = await pool.query(query, [commentId]);
    return result.rows[0];
  } catch (error) {
    console.log("COMMENTS BY ID DELETE SERVICE ERROR - ", error);
    throw error;
  }
};
