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
    path: "/socket",
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  // Estrutura para armazenar os sockets conectados a cada canal
  const channels = {};

  io.on("connection", (socket) => {
    console.log(`Client conectado: ${socket.id}`);

    // Quando um socket se desconecta
    socket.on("disconnect", () => {
      console.log(`Client desconectado: ${socket.id}`);
      // Remove o socket dos canais em que estava
      for (const channelId in channels) {
        channels[channelId].delete(socket.id);
        // Se não houver mais sockets no canal, podemos remover o canal
        if (channels[channelId].size === 0) {
          delete channels[channelId];
          console.log(`Canal ${channelId} removido (sem sockets)`);
        }
      }
    });

    // Entrando em um canal
    socket.on("joinChannel", ({ channelId }) => {
      socket.join(channelId);
      console.log(`Client ${socket.id} ouvindo Canal ${channelId}`);

      // Adiciona o socket ao conjunto do canal
      if (!channels[channelId]) {
        channels[channelId] = new Set(); // Cria um novo conjunto se o canal não existir
      }
      channels[channelId].add(socket.id);
    });

    // Saindo de um canal
    socket.on("leaveChannel", ({ channelId }) => {
      socket.leave(channelId);
      console.log(`Client ${socket.id} deixou de ouvir o Canal ${channelId}`);
      // Remove o socket do conjunto do canal
      if (channels[channelId]) {
        channels[channelId].delete(socket.id);
        // Se não houver mais sockets no canal, podemos remover o canal
        if (channels[channelId].size === 0) {
          delete channels[channelId];
          console.log(`Canal ${channelId} removido (sem sockets)`);
        }
      }
    });

    // Recebendo dados de áudio
    socket.on("audioData", ({ channelId, audio, username }) => {
      console.log(`Audio Recebido do Client ${socket.id} para o Canal ${channelId}`);
      socket.to(channelId).emit("audioData", { audio, username });

      // Log dos sockets que estão no canal
      const socketsInChannel = Array.from(channels[channelId] || []);
      console.log(`A mensagem foi enviada para os seguintes sockets: ${socketsInChannel.join(', ')}`);
    });

    // Evento de estado de usuário falando
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
