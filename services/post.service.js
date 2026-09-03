import pool from "../config/db.js";

export const createPostTableService = async () => {
  try {
    const query = `
      CREATE TABLE IF NOT EXISTS posts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,

        body VARCHAR(255),
        visibility VARCHAR(20) NOT NULL DEFAULT 'public',
        location TEXT,

        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

        CONSTRAINT fk_posts_user
          FOREIGN KEY (user_id)
          REFERENCES users(id)
          ON DELETE CASCADE,

        CONSTRAINT posts_visibility_check
          CHECK (visibility IN ('public', 'friends', 'private'))
      );
    `;

    await pool.query(query);
  } catch (error) {
    console.error("❌ CREATE POSTS TABLE ERROR - ", error);
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
          'profilePicUrl', u.profilePicUrl
        ) AS user
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

export const deletePostByIdService = async (id) => {
  try {
    const query = `DELETE * from POSTS WHERE id=$1`;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  } catch (error) {
    console.log("DELETE POST SERVICE ERROR - ", error);
    throw error;
  }
};
