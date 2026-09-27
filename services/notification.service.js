import pool from "../config/db.js";

export const createNotificationService = async ({
  client,
  recipientId,
  actorId,
  type,
  postId = null,
  likeId = null,
  commentId = null,
  followRequestID = null,
}) => {
  const query = `
        INSERT INTO notifications (
            recipient_id,
            actor_id,
            type,
            post_id,
            like_id,
            comment_id,
            follow_request_id
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *;
    `;

  const result = await client.query(query, [
    recipientId,
    actorId,
    type,
    postId,
    likeId,
    commentId,
    followRequestID,
  ]);

  return result.rows[0];
};

export const deleteNotificationByFollowRequestIDService = async (
  follow_request_id,
) => {
  const query = `
        DELETE from notifications
        WHERE follow_request_id = $1
        RETURNING *;
    `;

  const result = await pool.query(query, [follow_request_id]);

  return result.rows[0];
};

export const getNotificationByRecipentID = async (recipientId) => {
  const query = `  
    SELECT 
      n.created_at,
      n.id,
      n.is_read,
      n.post_id,
      n.type,
      json_build_object(
        'id', u.id,
        'name', u.name,
        'handle', u.handle,
        'profile_pic_url', u.profile_pic_url
      ) AS actor

    FROM notifications n
    JOIN users u
      ON n.actor_id = u.id
    WHERE n.recipient_id = $1
    ORDER BY n.created_at DESC
    LIMIT 20;
    `;

  const result = await pool.query(query, [recipientId]);

  return result.rows;
};
