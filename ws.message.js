import {
  createMessageService,
  getConversationParticipantsService,
  getMessageByIDService,
  markConversationReadService,
} from "./services/message.service.js";

import { WebSocket } from "ws";

export const websocket_Message_Switch = async (ws, connectedUsers, message) => {
  switch (message.type) {
    // =========================================================
    // SEND MESSAGE
    // =========================================================

    case "message:frontend->backend": {
      const { conversationId, content } = message;

      try {
        if (
          typeof conversationId !== "string" ||
          typeof content !== "string" ||
          !content.trim()
        ) {
          throw new Error("conversationId and non-empty content are required");
        }

        // 1. Save message to database
        const { id } = await createMessageService(
          conversationId,
          ws.userId,
          content.trim(),
        );

        const newMessage = await getMessageByIDService(id);

        // 2. Get all participants
        const participants =
          await getConversationParticipantsService(conversationId);

        // 3. Send message to everyone
        for (const participant of participants) {
          const userId = participant.user_id;

          const userSockets = connectedUsers.get(userId);

          if (!userSockets) {
            continue;
          }

          for (const socket of userSockets) {
            if (socket.readyState === WebSocket.OPEN) {
              socket.send(
                JSON.stringify({
                  type: "message:backend->frontend",
                  message: newMessage,
                }),
              );
            }
          }
        }
      } catch (error) {
        console.error("❌ Failed to send message:", error);

        ws.send(
          JSON.stringify({
            type: "message:error",
            message: "Failed to send message",
          }),
        );
      }

      break;
    }

    // =========================================================
    // CONVERSATION READ
    // =========================================================

    case "conversation:read(frontend->backend)": {
      const { conversationId } = message;

      try {
        if (typeof conversationId !== "string") {
          throw new Error("conversationId is required");
        }
        const readState = await markConversationReadService(
          conversationId,
          ws.userId,
        );

        const participants =
          await getConversationParticipantsService(conversationId);

        for (const participant of participants) {
          const participantID = participant.user_id;

          const userSockets = connectedUsers.get(participantID);

          for (const socket of userSockets) {
            if (socket.readyState === WebSocket.OPEN) {
              socket.send(
                JSON.stringify({
                  type: "conversation:read(backend->frontend)",
                  conversationId: readState.conversation_id,
                  userId: readState.user_id,
                  lastReadAt: readState.last_read_at,
                }),
              );
            }
          }
        }
      } catch (error) {
        console.error("❌ Failed to mark conversation as read:", error);
      }

      break;
    }

    default:
      console.log("❌ Invalid WebSocket Type:", message.type);
  }
};
