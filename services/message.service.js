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

export const getMessagesService = async (
  conversationId,
  userId,
  limit = 10,
  prevMessageID = null,
) => {
  try {
    let query;
    let params;

    if (prevMessageID) {
      query = `
        SELECT
          m.*,
          json_build_object(
            'id', u.id,
            'name', u.name,
            'handle', u.handle,
            'profile_pic_url', u.profile_pic_url
          ) AS sender

        FROM messages m

        JOIN users u
          ON u.id = m.sender_id

        JOIN conversation_participants cp
          ON cp.conversation_id = m.conversation_id
          AND cp.user_id = $2

        WHERE m.conversation_id = $1
          AND m.created_at < (
            SELECT created_at
            FROM messages
            WHERE id = $3::uuid
          )

        ORDER BY m.created_at DESC
        LIMIT $4;
      `;

      params = [conversationId, userId, prevMessageID, limit + 1];
    } else {
      query = `
        SELECT
          m.*,
          json_build_object(
            'id', u.id,
            'name', u.name,
            'handle', u.handle,
            'profile_pic_url', u.profile_pic_url
          ) AS sender

        FROM messages m

        JOIN users u
          ON u.id = m.sender_id

        JOIN conversation_participants cp
          ON cp.conversation_id = m.conversation_id
          AND cp.user_id = $2

        WHERE m.conversation_id = $1

        ORDER BY m.created_at DESC
        LIMIT $3;
      `;

      params = [conversationId, userId, limit + 1];
    }

    const result = await pool.query(query, params);

    const hasMore = result.rows.length > limit;

    const rows = result.rows.slice(0, limit);

    const messages = rows.map((row) => ({
      id: row.id,

      conversationId: row.conversation_id,

      sender: {
        id: row.sender.id,
        name: row.sender.name,
        handle: row.sender.handle,
        profilePic: row.sender.profile_pic_url,
      },

      content: row.content,

      created_at: row.created_at,

      readAt: row.read_at,
    }));

    return {
      messages,
      hasMore,
    };
  } catch (error) {
    console.log("GET MESSAGES SERVICE ERROR - ", error);
    throw error;
  }
};

export const getMessageByIDService = async (messageID) => {
  try {
    const query = `
      SELECT
        m.*,
        json_build_object(
          'id', u.id,
          'name',u.name ,
          'handle',u.handle, 
          'profile_pic_url', u.profile_pic_url
        ) as sender

      FROM messages m

      JOIN users u
        ON m.sender_id = u.id

      WHERE m.id = $1
    `;

    const result = await pool.query(query, [messageID]);

    return result.rows[0];
  } catch (error) {
    console.log("GET MESSAGE BY ID SERVICE ERROR - ", error);
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
      INSERT INTO messages 
      (conversation_id,sender_id,content)
      VALUES ($1, $2, $3)
      RETURNING id
    `;
    const result = await pool.query(query, [conversationId, senderId, content]);
    return result.rows[0];
  } catch (error) {
    console.log("CREATE MESSAGE SERVICE ERROR - ", error);
    throw error;
  }
};

export const getConversationParticipantsService = async (conversationId) => {
  const result = await pool.query(
    `
      SELECT user_id
      FROM conversation_participants
      WHERE conversation_id = $1
    `,
    [conversationId],
  );

  return result.rows;
};

export const markConversationReadService = async (conversationId, userId) => {
  const query = `
    UPDATE conversation_participants
    SET last_read_at = NOW()
    WHERE conversation_id = $1
      AND user_id = $2
    RETURNING
      conversation_id,
      user_id,
      last_read_at;
  `;

  const result = await pool.query(query, [conversationId, userId]);

  if (result.rowCount === 0) {
    throw new Error("User is not a participant in this conversation");
  }

  return result.rows[0];
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
