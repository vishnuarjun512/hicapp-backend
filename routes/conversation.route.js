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
import { getPathname } from "../utils/http.js";

export const conversationRoutes = (req, res) => {
  const pathname = getPathname(req);
  const messageMatch = pathname.match(/^\/api\/conversations\/([^/]+)\/messages$/);
  if (
    req.method == "GET" &&
    messageMatch
  ) {
    const [, conversationId] = messageMatch;
    getMessages(req, res, conversationId);
    return true;
  }

  if (
    req.method == "POST" && messageMatch
  ) {
    const [, conversationId] = messageMatch;
    createMessage(req, res, conversationId);
    return true;
  }

  if (req.method === "POST" && pathname === "/api/conversations") {
    createConversation(req, res);
    return true;
  }

  if (req.method == "GET" && pathname === "/api/conversations") {
    getConversations(req, res);
    return true;
  }

  return false;
};
