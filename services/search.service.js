import pool from "../config/db.js";

export const searchUsersService = async (query, userId) => {
  const searchTerm = `%${query}%`;

  const sql = `
      SELECT
        u.id,
        u.name,
        u.handle,
        u.bio,
        u.profile_pic_url
      FROM users u
      WHERE
        u.id <> $1
        AND u.verified = true
        AND (
          u.name ILIKE $2
          OR u.handle ILIKE $2
          OR u.bio ILIKE $2
        )
      ORDER BY
        CASE
          WHEN u.handle ILIKE $3 THEN 1
          WHEN u.name ILIKE $3 THEN 2
          ELSE 3
        END,
        u.created_at DESC
      LIMIT 10;
    `;

  const result = await pool.query(sql, [userId, searchTerm, query]);

  return result.rows;
};

export const searchPostsService = async (query, userId) => {
  const searchTerm = `%${query}%`;

  const sql = `
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
      ) AS likes,

      (
        SELECT COUNT(*)
        FROM comments c
        WHERE c.post_id = p.id
      ) AS comments,

      EXISTS (
        SELECT 1
        FROM likes l
        WHERE l.post_id = p.id
          AND l.user_id = $1
      ) AS liked

    FROM posts p
    INNER JOIN users u
      ON u.id = p.user_id

    WHERE
      p.body ILIKE $2
      AND u.verified = true

    ORDER BY p.created_at DESC
    LIMIT 10;
  `;

  const result = await pool.query(sql, [userId, searchTerm]);

  return result.rows;
};
