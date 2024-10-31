import { NextApiRequest, NextApiResponse } from 'next';
import { Server } from 'socket.io';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log("Requisição recebida");
  if (res.socket && !(res.socket as any).server.io) {
    console.log("Iniciando servidor Socket.io");

    const io = new Server((res.socket as any).server, {
      path: "/socket", 
      cors: {
        origin: "*", 
        methods: ["GET", "POST"]
      },
    });

    (res.socket as any).server.io = io;

    io.on('connection', (socket) => {
      console.log(`Client connected: ${socket.id}`);

      socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
      });

      socket.on('joinChannel', ({ channelId }) => {
        socket.join(channelId);
        console.log(`Client ${socket.id} joined Channel ${channelId}`);
      });

      socket.on('leaveChannel', ({ channelId }) => {
        socket.leave(channelId);
        console.log(`Client ${socket.id} left Channel ${channelId}`);
      });

      socket.on('audioData', ({ channelId, audio, username }) => {
        console.log(`Received audio from ${socket.id} for channel ${channelId}`);
        socket.to(channelId).emit('audioData', { audio, username });
      });

      socket.on('userTalking', ({ channelId, username, state }) => {
        socket.to(channelId).emit('userTalking', { username, state });
      });
    });
  }

  res.end();
}
