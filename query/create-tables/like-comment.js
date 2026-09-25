export const createLikeTableQuery = `
  CREATE TABLE IF NOT EXISTS likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    post_id UUID NOT NULL,

    reaction VARCHAR(20),

    CONSTRAINT fk_like_user
      FOREIGN KEY (user_id)
      REFERENCES users(id)
      ON DELETE CASCADE,

    CONSTRAINT fk_like_post
      FOREIGN KEY (post_id)
      REFERENCES posts(id)
      ON DELETE CASCADE,

    CONSTRAINT unique_user_post_like
      UNIQUE (user_id, post_id)
  );
`;

export const createCommentTableQuery = `
  CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    post_id UUID NOT NULL,

    comment TEXT NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_comment_user
      FOREIGN KEY (user_id)
      REFERENCES users(id)
      ON DELETE CASCADE,

    CONSTRAINT fk_comment_post
      FOREIGN KEY (post_id)
      REFERENCES posts(id)
      ON DELETE CASCADE
  );
`;

export const createIndexesForLikesAndCommentsQuery = `
    CREATE INDEX IF NOT EXISTS idx_likes_post_id
    ON likes(post_id);

    CREATE INDEX IF NOT EXISTS idx_comments_post_id
    ON comments(post_id);
`;
