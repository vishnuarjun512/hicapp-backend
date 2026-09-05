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

        u.id AS user_id,
        u.name AS user_name,
        u.handle AS user_handle,
        u."profile_pic_url" AS user_profile_pic,

        lm.content AS last_message,
        lm.created_at AS last_message_at,

        COUNT(
          CASE
            WHEN lm.sender_id <> $1
            AND lm.read_at IS NULL
            THEN 1
          END
        ) AS unread_count

      FROM conversation c

      JOIN conversation_participants cp
        ON c.id = cp.conversation_id

      JOIN conversation_participants other_cp
        ON c.id = other_cp.conversation_id
        AND other_cp.user_id <> $1

      JOIN users u
        ON u.id = other_cp.user_id

      LEFT JOIN LATERAL (
        SELECT
          m.content,
          m.sender_id,
          m.created_at,
          m.read_at
        FROM messages m
        WHERE m.conversation_id = c.id
        ORDER BY m.created_at DESC
        LIMIT 1
      ) lm ON true

      WHERE cp.user_id = $1

      GROUP BY
        c.id,
        u.id,
        u.name,
        u.handle,
        u."profile_pic_url",
        lm.content,
        lm.sender_id,
        lm.created_at,
        lm.read_at

      ORDER BY lm.created_at DESC NULLS LAST;
    `;

    const result = await pool.query(query, [userId]);

    return result.rows.map((row) => ({
      id: row.conversation_id,

      user: {
        id: row.user_id,
        name: row.user_name,
        handle: row.user_handle,
        profilePic: row.user_profile_pic,
      },

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
  The raw SQL result might look like:

  {
    conversation_id: "abc-123",
    user_id: "rahul-id",
    user_name: "Rahul",
    user_handle: "rahul",
    user_profile_pic: "...",
    last_message: "Are you free tomorrow?",
    last_message_at: "...",
    unread_count: "2"
  }

  But your frontend shouldn't need to know about that SQL structure.

  The service converts it to:

  {
    id: "abc-123",

    user: {
      id: "rahul-id",
      name: "Rahul",
      handle: "rahul",
      profilePic: "..."
    },

    preview: "Are you free tomorrow?",
    unread: 2,
    lastMessageAt: "..."
  }

  Exactly what your ConversationList wants.
*/
