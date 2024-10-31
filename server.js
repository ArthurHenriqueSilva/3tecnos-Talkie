import { createServer } from "http";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);
  
  const io = new Server(httpServer, {
    path: "/socket", // Defina o caminho para o Socket.IO
    cors: {
      origin: "*", // Permita todas as origens (ajuste conforme necessário)
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
    });

    // Aqui você pode adicionar outros eventos de socket
    socket.on("joinChannel", ({ channelId }) => {
      socket.join(channelId);
      console.log(`Client ${socket.id} joined Channel ${channelId}`);
    });

    socket.on("leaveChannel", ({ channelId }) => {
      socket.leave(channelId);
      console.log(`Client ${socket.id} left Channel ${channelId}`);
    });

    socket.on("audioData", ({ channelId, audio, username }) => {
      console.log(`Received audio from ${socket.id} for channel ${channelId}`);
      socket.to(channelId).emit("audioData", { audio, username });
    });

    socket.on("userTalking", ({ channelId, username, state }) => {
      socket.to(channelId).emit("userTalking", { username, state });
    });
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
