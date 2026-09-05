/*

Your routes

I'd make your initial API:

POST   /api/conversations

GET    /api/conversations

GET    /api/conversations/:id/messages

POST   /api/conversations/:id/messages

Later:

PATCH  /api/messages/:id/read

PATCH  /api/messages/:id

DELETE /api/messages/:id

So your frontend flow becomes:

*/

import {
  createConversation,
  getConversations,
} from "../controller/conversation.controller.js";
import {
  createMessage,
  getMessages,
} from "../controller/message.controller.js";

export const conversationRoutes = (req, res) => {
  if (req.method === "POST" && req.url.startsWith("/api/conversation")) {
    createConversation(req, res);
    return true;
  }

  if (req.method == "GET" && req.url.startsWith("/api/conversation")) {
    const userId = req.url.split("/").pop();
    getConversations(req, res, userId);
    return true;
  }

  if (
    req.method == "GET" &&
    req.url.startsWith("/api/conversation") &&
    req.url.endsWith("/messages")
  ) {
    const parts = req.url.split("/");
    const conversationId = parts[3];
    getMessages(req, res, conversationId);
    return true;
  }

  if (
    req.method == "POST" &&
    req.url.startsWith("/api/conversation") &&
    req.url.endsWith("/messages")
  ) {
    const parts = req.url.split("/");
    const conversationId = parts[3];
    createMessage(req, res, conversationId);
    return true;
  }

  return false;
};
