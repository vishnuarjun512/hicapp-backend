export const createFollowTableQuery = `
    CREATE TABLE IF NOT EXISTS follow (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      follower_id UUID NOT NULL,
      following_id UUID NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

      CONSTRAINT fk_follower
        FOREIGN KEY (follower_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

      CONSTRAINT fk_following
        FOREIGN KEY (following_id)
        REFERENCES users(id)
        ON DELETE CASCADE,
      
      CONSTRAINT cannot_follow_self
        CHECK (follower_id <>following_id),

      CONSTRAINT unique_follow
        UNIQUE (follower_id, following_id)
    )
`;

export const createFollowRequestTableQuery = `
      CREATE TABLE IF NOT EXISTS follow_request(
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        sender_id UUID NOT NULL,
        receiver_id UUID NOT NULL,

        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

        CONSTRAINT fk_request_sender
          FOREIGN KEY (sender_id)
          REFERENCES users(id)
          ON DELETE CASCADE,
        
        CONSTRAINT fk_request_receiver
          FOREIGN KEY (receiver_id)
          REFERENCES users(id)
          ON DELETE CASCADE,
        
        CONSTRAINT cannot_send_fr_to_self
          CHECK (sender_id <> receiver_id),

        CONSTRAINT unique_fr
          UNIQUE (sender_id, receiver_id)
      )
`;

export const createUsersTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100),
        email VARCHAR(255),
        handle VARCHAR(100),
        verified BOOLEAN NOT NULL DEFAULT FALSE,
        password TEXT NOT NULL,
        bio VARCHAR(255),
        profile_pic_url VARCHAR(255),
        is_private BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )  
`;

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
          CHECK (visibility IN ('public', 'friends', 'private'))
      );
    `;

export const createConversationTableQuery = `
  CREATE TABLE IF NOT EXISTS conversation(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW() 
  )
`;

export const createConversationParticipantsTableQuery = `
  CREATE TABLE IF NOT EXISTS conversation_participants (
    id UUID DEFAULT gen_random_uuid(),

    conversation_id UUID NOT NULL,
    user_id UUID NOT NULL,

    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    PRIMARY KEY (conversation_id, user_id),
    
    CONSTRAINT fk_conversation
      FOREIGN KEY (conversation_id)
      REFERENCES conversation(id)
      ON DELETE CASCADE,

    CONSTRAINT fk_user
      FOREIGN KEY (user_id)
      REFERENCES users(id)
      ON DELETE CASCADE
  )
`;

export const createMessagesTableQuery = `
  CREATE TABLE IF NOT EXISTS messages(
    id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),

    conversation_id UUID NOT NULL,
    sender_id UUID NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    read_at TIMESTAMPTZ,

    CONSTRAINT fk_message_conversation
      FOREIGN KEY (conversation_id)
      REFERENCES conversation(id)
      ON DELETE CASCADE,

    CONSTRAINT fk_message_sender
      FOREIGN KEY (sender_id)
      REFERENCES users(id)
      ON DELETE CASCADE
  )
`;

export const createConversationIndexesQuery = `
  CREATE INDEX IF NOT EXISTS idx_messages_conversation_created
    ON messages(conversation_id, created_at DESC);

  CREATE INDEX IF NOT EXISTS idx_conversation_participants_user
    ON conversation_participants(user_id);
`;
