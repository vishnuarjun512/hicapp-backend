import pool from "../config/db.js";
import {
  createConversationIndexesQuery,
  createMessagesTableQuery,
} from "../query/create-tables.js";

export const createMessageTableService = async () => {
  try {
    await pool.query(createMessagesTableQuery);
    console.log("✅ Message table created");
  } catch (error) {
    console.log("CREATE MESSAGE TABLE SERVICE ERROR - ", error);
    throw error;
  }
};

export const createIndexesForMessagesAndConversationService = async () => {
  try {
    await pool.query(createConversationIndexesQuery);
    console.log("✅ Conversation and Messages Indexes created");
  } catch (error) {
    console.log("CREATE INDEXES SERVICE ERROR - ", error);
    throw error;
  }
};

export const getMessagesService = async (conversationId, userId) => {
  try {
    const query = `
      SELECT
        m.id,
        m.conversation_id,
        m.content,
        m.created_at,
        m.read_at,

        u.id AS sender_id,
        u.name AS sender_name,
        u.handle AS sender_handle,
        u."profile_pic_url" AS sender_profile_pic

      FROM messages m

      JOIN users u
        ON u.id = m.sender_id

      JOIN conversation_participants cp
        ON cp.conversation_id = m.conversation_id
        AND cp.user_id = $2

      WHERE m.conversation_id = $1

      ORDER BY m.created_at ASC;
    `;

    const result = await pool.query(query, [conversationId, userId]);

    return result.rows.map((row) => ({
      id: row.id,

      conversationId: row.conversation_id,

      sender: {
        id: row.sender_id,
        name: row.sender_name,
        handle: row.sender_handle,
        profilePic: row.sender_profile_pic,
      },

      content: row.content,

      createdAt: row.created_at,

      readAt: row.read_at,
    }));
  } catch (error) {
    console.log("GET MESSAGES SERVICE ERROR - ", error);

    throw error;
  }
};

export const createMessageService = async (
  conversationId,
  senderId,
  content,
) => {
  try {
    const query = `
      INSERT INTO messages (
        conversation_id,
        sender_id,
        content
      )
      SELECT
        $1,
        $2,
        $3
      WHERE EXISTS (
        SELECT 1
        FROM conversation_participants
        WHERE conversation_id = $1
        AND user_id = $2
      )
      RETURNING
        id,
        conversation_id,
        sender_id,
        content,
        created_at,
        read_at;
    `;

    const result = await pool.query(query, [conversationId, senderId, content]);

    if (result.rows.length === 0) {
      throw new Error("User is not a participant in this conversation");
    }

    return result.rows[0];
  } catch (error) {
    console.log("CREATE MESSAGE SERVICE ERROR - ", error);

    throw error;
  }
};

/*
  Now your frontend gets exactly:

  {
    "id": "msg-123",
    "conversationId": "conv-123",

    "sender": {
      "id": "user-123",
      "name": "Vishnu",
      "handle": "vishnu",
      "profilePic": "..."
    },

    "content": "Hey Rahul!",
    "createdAt": "2026-09-05T03:00:00Z",
    "readAt": null
  }
*/
