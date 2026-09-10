import pool from "../config/db.js";
import {
  createConversationParticipantsTableQuery,
  createConversationTableQuery,
} from "../query/create-tables.js";

export const createConversationTableService = async () => {
  try {
    await pool.query(createConversationTableQuery);
    console.log("✅ Conversation table created");
    await pool.query(createConversationParticipantsTableQuery);
    console.log("✅ Conversation Participants table created");
  } catch (error) {
    console.log("CREATE CONVERSATION TABLE SERVICE ERROR - ", error);
    throw error;
  }
};

export const createConversationService = async (userId, otherUserId) => {
  try {
    // Check whether a conversation already exists
    const existingConversationQuery = `
      SELECT c.id
      FROM conversation c
      JOIN conversation_participants cp1
        ON c.id = cp1.conversation_id
      JOIN conversation_participants cp2
        ON c.id = cp2.conversation_id
      WHERE cp1.user_id = $1
        AND cp2.user_id = $2
      GROUP BY c.id
      HAVING COUNT(*) = 2;
    `;

    const existingConversation = await pool.query(existingConversationQuery, [
      userId,
      otherUserId,
    ]);

    if (existingConversation.rows.length > 0) {
      return existingConversation.rows[0];
    }

    // Create conversation
    const conversationQuery = `
      INSERT INTO conversation
      DEFAULT VALUES
      RETURNING id, created_at, updated_at;
    `;

    const conversationResult = await pool.query(conversationQuery);

    const conversation = conversationResult.rows[0];

    // Add participants
    const participantsQuery = `
      INSERT INTO conversation_participants
        (conversation_id, user_id)
      VALUES
        ($1, $2),
        ($1, $3);
    `;

    await pool.query(participantsQuery, [conversation.id, userId, otherUserId]);

    return conversation;
  } catch (error) {
    console.log("CREATE CONVERSATION SERVICE ERROR - ", error);
    throw error;
  }
};

export const getConversationsService = async (userId) => {
  try {
    const query = `
      SELECT
        c.id AS conversation_id,

        COALESCE(
          JSON_AGG(
            DISTINCT JSONB_BUILD_OBJECT(
              'id', u.id,
              'name', u.name,
              'handle', u.handle,
              'profilePic', u."profile_pic_url",
              'lastReadAt', cp_all.last_read_at
            )
          ) FILTER (WHERE u.id IS NOT NULL),
          '[]'
        ) AS participants,

        lm.content AS last_message,
        lm.created_at AS last_message_at,

        COUNT(
          CASE
            WHEN m.sender_id <> $1
            AND m.created_at > COALESCE(cp.last_read_at, 'epoch')
            THEN 1
          END
        ) AS unread_count

      FROM conversation c

      -- Current user's participant row
      JOIN conversation_participants cp
        ON c.id = cp.conversation_id
        AND cp.user_id = $1

      -- All participants in the conversation
      LEFT JOIN conversation_participants cp_all
        ON c.id = cp_all.conversation_id

      -- User information for every participant
      LEFT JOIN users u
        ON u.id = cp_all.user_id

      -- Latest message
      LEFT JOIN LATERAL (
        SELECT
          m.content,
          m.sender_id,
          m.created_at
        FROM messages m
        WHERE m.conversation_id = c.id
        ORDER BY m.created_at DESC
        LIMIT 1
      ) lm ON true

      -- All messages for unread count
      LEFT JOIN messages m
        ON m.conversation_id = c.id

      GROUP BY
        c.id,
        lm.content,
        lm.created_at,
        cp.last_read_at

      ORDER BY lm.created_at DESC NULLS LAST;
    `;

    const result = await pool.query(query, [userId]);

    return result.rows.map((row) => ({
      id: row.conversation_id,

      participants: row.participants,

      preview: row.last_message ?? "",
      unread: Number(row.unread_count),

      lastMessageAt: row.last_message_at,
    }));
  } catch (error) {
    console.log("GET CONVERSATIONS SERVICE ERROR - ", error);

    throw error;
  }
};

/*
Now a conversation will come back like:

{
  "id": "conversation-id",

  "participants": [
    {
      "id": "your-user-id",
      "name": "Vishnu",
      "handle": "vishnu",
      "profilePic": null,
      "lastReadAt": "2026-09-11T03:20:00.000Z"
    },
    {
      "id": "rahul-user-id",
      "name": "Rahul",
      "handle": "rahul",
      "profilePic": null,
      "lastReadAt": "2026-09-11T03:25:00.000Z"
    }
  ],

  "preview": "Hey bro",
  "unread": 0,
  "lastMessageAt": "2026-09-11T03:26:00.000Z"
}
*/
