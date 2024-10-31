import { NextResponse } from 'next/server';
import { Server } from 'socket.io';

let io: Server | null = null;

const initSocket = (server: any) => {
  if (!io) {
    io = new Server(server, {
      path: "/socket",
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });

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
};

export async function POST(req: Request) {
  console.log("Requisição recebida");

  const { socket } = req as any;

  if (socket) {
    const server = socket.server;
    initSocket(server);
  }

  return NextResponse.json({ message: 'Socket initialized' });
}

export const config = {
  api: {
    bodyParser: false,
  },
};
