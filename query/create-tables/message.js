export const createMessagesTableQuery = `
  CREATE TABLE IF NOT EXISTS messages(
    id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),

    conversation_id UUID NOT NULL,
    sender_id UUID NOT NULL,

    content TEXT,

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
