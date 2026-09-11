import {
  createMessageService,
  getConversationParticipantsService,
  markConversationReadService,
} from "./services/message.service.js";

import { WebSocket } from "ws";

export const websocket_Message_Switch = async (ws, connectedUsers, message) => {
  switch (message.type) {
    // =========================================================
    // SEND MESSAGE
    // =========================================================

    case "message:send": {
      const { conversationId, content } = message;

      try {
        // 1. Save message to database
        const newMessage = await createMessageService(
          conversationId,
          ws.userId,
          content,
        );

        console.log("💾 Message saved:", newMessage);

        // 2. Get all participants
        const participants =
          await getConversationParticipantsService(conversationId);

        console.log("👥 Participants:", participants);

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
                  type: "message:new",
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

    case "conversation:read": {
      const { conversationId } = message;

      try {
        const readState = await markConversationReadService(
          conversationId,
          ws.userId,
        );

        console.log("📖 Read state:", readState);

        const participants =
          await getConversationParticipantsService(conversationId);

        console.log("👥 Participants:", participants);

        for (const participant of participants) {
          const participantID = participant.user_id;

          if (participantID === ws.userId) {
            continue;
          }

          const userSockets = connectedUsers.get(participantID);

          if (!userSockets) {
            console.log("⚠️ No socket found for user:", participantID);
            continue;
          }

          for (const socket of userSockets) {
            if (socket.readyState === WebSocket.OPEN) {
              console.log("📤 Sending conversation:read to:", participantID);

              socket.send(
                JSON.stringify({
                  type: "conversation:read",
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
