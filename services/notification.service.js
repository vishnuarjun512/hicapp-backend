import pool from "../config/db.js";

export const createNotificationService = async ({
  recipientId,
  actorId,
  type,
  postId = null,
  commentId = null,
  friendRequestId = null,
}) => {
  const query = `
        INSERT INTO notifications (
            recipient_id,
            actor_id,
            type,
            post_id,
            comment_id,
            friend_request_id
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *;
    `;

  const result = await pool.query(query, [
    recipientId,
    actorId,
    type,
    postId,
    commentId,
    friendRequestId,
  ]);

  return result.rows[0];
};

export const getNotificationByRecipentID = async (recipientId) => {
  const query = `  
    SELECT *
    FROM notifications
    WHERE recipient_id = $1
    ORDER BY created_at DESC
    LIMIT 20;
    RETURNING *;
    `;

  const result = await pool.query(query, [recipientId]);

  return result.rows;
};
