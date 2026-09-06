import {
  getMessagesService,
  createMessageService,
} from "../services/message.service.js";

import { BodyReader } from "../utils/dataReader.js";
import { verifyToken } from "../utils/jwt.js";

export const getMessages = async (req, res, conversationId) => {
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

    const messages = await getMessagesService(conversationId, user.userId);

    res.statusCode = 200;

    res.end(
      JSON.stringify({
        messages,
      }),
    );
  } catch (error) {
    console.log("GET MESSAGES CONTROLLER ERROR - ", error);

    res.statusCode = 500;

    res.end(
      JSON.stringify({
        message: "Internal Server Error",
      }),
    );
  }
};

export const createMessage = async (req, res, conversationId) => {
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

    const { content } = await BodyReader(req);

    if (!content || !content.trim()) {
      res.statusCode = 400;

      res.end(
        JSON.stringify({
          message: "Message cannot be empty",
        }),
      );

      return;
    }

    const message = await createMessageService(
      conversationId,
      user.userId,
      content.trim(),
    );

    res.statusCode = 201;

    res.end(
      JSON.stringify({
        message,
      }),
    );
  } catch (error) {
    console.log("CREATE MESSAGE CONTROLLER ERROR - ", error);

    res.statusCode = 500;

    res.end(
      JSON.stringify({
        message: "Internal Server Error",
      }),
    );
  }
};
