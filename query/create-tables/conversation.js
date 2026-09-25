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
    last_read_at TIMESTAMPTZ DEFAULT NOW(),

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

export const createConversationIndexesQuery = `
  CREATE INDEX IF NOT EXISTS idx_messages_conversation_created
    ON messages(conversation_id, created_at DESC);

  CREATE INDEX IF NOT EXISTS idx_conversation_participants_user
    ON conversation_participants(user_id);
`;
