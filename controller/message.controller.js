import {
  getMessagesService,
  createMessageService,
} from "../services/message.service.js";

import { BodyReader } from "../utils/dataReader.js";

export const getMessages = async (req, res, conversationId) => {
  try {
    const data = await BodyReader(req);
    const { userId } = data;

    const messages = await getMessagesService(conversationId, userId);

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
    const { userId, content } = await BodyReader(req);

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
      userId,
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
