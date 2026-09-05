import {
  createConversationService,
  getConversationsService,
} from "../services/conversation.service.js";
import { BodyReader } from "../utils/dataReader.js";

export const getConversations = async (req, res, userId) => {
  try {
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
    const { user_id, otherUserId } = await BodyReader(req);

    const conversation = await createConversationService(user_id, otherUserId);

    res.statusCode = 201;

    res.end(
      JSON.stringify({
        conversation,
      }),
    );
  } catch (error) {
    console.log("CREATE CONVERSATION CONTROLLER ERROR - ", error);

    res.statusCode = 500;

    res.end(
      JSON.stringify({
        message: "Internal Server Error",
      }),
    );
  }
};
