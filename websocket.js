import { WebSocketServer } from "ws";
import { readJWT, getTokenFromCookie } from "./utils/jwt.js";
import { randomUUID } from "crypto";

import {
  createMessageService,
  getConversationParticipantsService,
  markConversationReadService,
} from "./services/message.service.js";

export const setupWebSocket = (server) => {
  const wss = new WebSocketServer({
    noServer: true,
  });

  const connectedUsers = new Map();

  server.on("upgrade", (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit("connection", ws, request);
    });
  });

  wss.on("connection", (ws, req) => {
    const socketId = randomUUID();

    ws.socketId = socketId;

    console.log("WebSock Client Connected");
    console.log("Socket ID:", socketId);
    try {
      // Get access token from cookie
      const token = getTokenFromCookie(req);

      if (!token) {
        console.log("❌ No access token");

        ws.close(1008, "Authentication required");
        return;
      }

      // Verify JWT
      const payload = readJWT(token);

      console.log("Authenticated user:", payload.userId);

      // Attach authenticated user to socket
      ws.userId = payload.userId;

      if (!connectedUsers.has(ws.userId)) {
        connectedUsers.set(ws.userId, new Set());
      }

      connectedUsers.get(ws.userId).add(ws);

      console.log("🔐 WebSocket authenticated");

      console.log(
        "Connected Users ->",
        [...connectedUsers.entries()].map(([userId, sockets]) => ({
          userId,
          socketIds: [...sockets].map((socket) => socket.socketId),
        })),
      );

      ws.send(
        JSON.stringify({
          type: "connected",
          message: "WebSocket authenticated",
        }),
      );
    } catch (error) {
      console.log("❌ WebSocket authentication failed:", error);

      ws.close(1008, "Invalid or expired token");

      return;
    }

    ws.on("message", async (data) => {
      try {
        const message = JSON.parse(data.toString());

        console.log("📨 WebSocket event:", message);

        if (message.type === "message:send") {
          const { conversationId, content } = message;

          const newMessage = await createMessageService(
            conversationId,
            ws.userId,
            content,
          );

          const participants =
            await getConversationParticipantsService(conversationId);

          console.log("👥 Participants:", participants);

          for (const participant of participants) {
            const userId = participant.user_id;

            // Don't send it back to the sender here
            if (userId === ws.userId) {
              continue;
            }

            const userSockets = connectedUsers.get(userId);

            if (!userSockets) {
              continue;
            }

            for (const socket of userSockets) {
              if (socket.readyState === socket.OPEN) {
                socket.send(
                  JSON.stringify({
                    type: "message:new",
                    message: newMessage,
                  }),
                );
              }
            }
          }

          // Send the saved message back to sender
          ws.send(
            JSON.stringify({
              type: "message:new",
              message: newMessage,
            }),
          );
        }

        if (message.type == "conversation:read") {
          const { conversationId } = message;
          const participants = await markConversationReadService(
            conversationId,
            ws.userId,
          );

          for (const participant of participants) {
            const participantID = participant.user_id;

            // Don't send it back to the sender here
            if (participantID === ws.userId) {
              continue;
            }

            const userSockets = connectedUsers.get(participantID);

            if (!userSockets) {
              continue;
            }

            for (const socket of userSockets) {
              if (socket.readyState === socket.OPEN) {
                socket.send(
                  JSON.stringify({
                    type: "message:read",
                  }),
                );
              }
            }
          }

          console.log(
            `👀 User ${ws.userId} read conversation ${conversationId}`,
          );
        }
      } catch (error) {
        console.log("❌ WebSocket message error:", error);
      }
    });

    ws.on("close", () => {
      console.log("WebSocket disconnected:", ws.userId);

      const userSockets = connectedUsers.get(ws.userId);

      if (!userSockets) {
        return;
      }

      userSockets.delete(ws);

      if (userSockets.size === 0) {
        connectedUsers.delete(ws.userId);
      }

      console.log("Connected Users ->", connectedUsers);
    });

    ws.on("error", (error) => {
      console.log("WebSocket error:", error);
    });
  });

  console.log("WebSocket server initialized");
};
