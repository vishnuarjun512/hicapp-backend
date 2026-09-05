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
import { requireAuth, requireSameUser } from "../utils/jwt.js";

export const conversationRoutes = (req, res) => {
  if (
    req.method == "GET" &&
    req.url.startsWith("/api/conversation") &&
    req.url.endsWith("/messages")
  ) {
    if (!requireAuth(req, res)) return true;
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
    if (!requireAuth(req, res)) return true;
    const parts = req.url.split("/");
    const conversationId = parts[3];
    createMessage(req, res, conversationId);
    return true;
  }

  if (req.method === "POST" && req.url === "/api/conversation") {
    if (!requireAuth(req, res)) return true;
    createConversation(req, res, req.auth.userId);
    return true;
  }

  if (req.method == "GET" && req.url === "/api/conversation") {
    if (!requireAuth(req, res)) return true;
    getConversations(req, res, req.auth.userId);
    return true;
  }

  if (req.method == "GET" && req.url.startsWith("/api/conversation/")) {
    if (!requireAuth(req, res)) return true;
    const userId = req.url.split("/").pop();
    if (!requireSameUser(req, res, userId)) return true;
    getConversations(req, res, userId);
    return true;
  }

  return false;
};
