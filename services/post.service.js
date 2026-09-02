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

export const getAllPostService = async () => {
  try {
    const query = `SELECT * from posts;`;
    const posts = await pool.query(query);
    return posts.rows;
  } catch (error) {
    console.log("GET POSTS ERROR - ", error);
  }
};

export const createPostService = async (
  userid,
  content,
  visbility = "public",
) => {
  try {
    const query = `INSERT INTO posts (user_id, body, visibility)
               VALUES($1, $2, $3)
               RETURNING id, user_id, body, visibility;
        `;

    const post = await pool.query(query, [userid, content, visbility]);
    return post.rows[0];
  } catch (error) {
    console.log("CREATE POST SERVICE ERROR - ", error);
  }
};
