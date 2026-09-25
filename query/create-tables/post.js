export const createPostTableQuery = `
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
          CHECK (visibility IN ('public', 'private'))
      );
    `;

export const createPostImagesTableQuery = `
    CREATE TABLE post_images (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

        post_id UUID NOT NULL,
        user_id UUID NOT NULL,
        image_url TEXT NOT NULL,
        position INTEGER NOT NULL,

        created_at TIMESTAMP DEFAULT NOW(),

        CONSTRAINT fk_post_images_post
          FOREIGN KEY (post_id)
          REFERENCES posts(id)
          ON DELETE CASCADE,

        CONSTRAINT fk_post_images_user
          FOREIGN KEY (user_id)
          REFERENCES users(id)
          ON DELETE CASCADE,

        CONSTRAINT unique_post_image_position
          UNIQUE (post_id, position)
    );
    `;
