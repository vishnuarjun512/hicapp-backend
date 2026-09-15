import {
  createConversationService,
  getConversationsService,
} from "../services/conversation.service.js";
import { BodyReader } from "../utils/dataReader.js";
import { requireAuthenticatedUser, verifyToken } from "../utils/jwt.js";

export const getConversations = async (req, res) => {
  try {
    const user = verifyToken(req);
    if (!user) {
      res.statusCode = 401;
      res.end(
        JSON.stringify({
          message: "Authentication required",
        }),
      );
      return;
    }

    const conversations = await getConversationsService(user.userId);

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

    res.statusCode = error.statusCode ?? 500;

    res.end(
      JSON.stringify({
        message: error.statusCode ? error.message : "Internal Server Error",
      }),
    );
  }
};
