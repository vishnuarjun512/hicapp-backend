import {
  createConversationService,
  deleteConversationService,
  getConversationsService,
} from "../services/conversation.service.js";
import { BodyReader } from "../utils/dataReader.js";
import { requireAuthenticatedUser } from "../utils/jwt.js";
import { unVerifiedActivites } from "../middleware/unverified.js";
import { getUserByIdService } from "../services/user.service.js";

import { sendError, sendJson } from "../utils/http.js";
import pool from "../config/db.js";

export const getConversations = async (req, res) => {
  try {
    const { userId } = requireAuthenticatedUser(req);

    const conversations = await getConversationsService(userId);

    res.statusCode = 200;
    res.end(
      JSON.stringify({
        conversations,
      }),
    );
  } catch (error) {
    console.log("GET CONVERSATIONS CONTROLLER ERROR - ", error);

    res.statusCode = 500;

    res.end(
      JSON.stringify({
        message: "Internal Server Error",
      }),
    );
  }
};

export const createConversation = async (req, res) => {
  try {
    const { userId } = requireAuthenticatedUser(req);

    const user = await getUserByIdService(userId);

    unVerifiedActivites(user);

    const { otherUserId } = await BodyReader(req);

    if (typeof otherUserId !== "string" || !otherUserId) {
      res.statusCode = 400;
      res.end(JSON.stringify({ message: "otherUserId is required" }));
      return;
    }

    const conversation = await createConversationService(userId, otherUserId);

    res.statusCode = 201;

    res.end(
      JSON.stringify({
        conversation,
      }),
    );
  } catch (error) {
    console.log("CREATE CONVERSATION CONTROLLER ERROR - ", error);

    sendError(
      res,
      error.statusCode ?? 500,
      error.message ?? "Internal Server Error",
    );
  }
};

export const deleteConversation = async (req, res, conversationId) => {
  const client = await pool.connect();
  try {
    requireAuthenticatedUser(req);

    const { id } = await deleteConversationService(client, conversationId);

    res.statusCode = 201;

    console.log("Deleted Conversation");
    sendJson(res, 200, {
      id,
      message: "Deleted Conversation",
    });
  } catch (error) {
    console.log("DELETE CONVERSATION CONTROLLER ERROR - ", error);

    sendError(
      res,
      error.statusCode ?? 500,
      error.message ?? "Internal Server Error",
    );
  }
};
