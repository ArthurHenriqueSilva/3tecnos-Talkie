"use client";

import { createContext, useContext, useState } from "react";
import { io, Socket } from "socket.io-client";

import { url } from "../proxy/proxy";

import { useUser } from "./User";

interface SocketProps {
  socket: Socket | null;
  connectSocket: (channelName: string) => void;
  disconnectSocket: () => void;
  sendAudio: (audio: ArrayBuffer) => void;
  isTalking: boolean;
  setIsTalking: (value: boolean) => void;
  lastUser: string | null;
  StartTalking: () => void;
  StopTalking: () => void;
}

const SocketContext = createContext<SocketProps | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error(
      "useSocket deve ser utilizado envolto em um SocketProvider",
    );
  }
  return context;
};

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [channelName, setChannelName] = useState<string>("");
  const [isTalking, setIsTalking] = useState<boolean>(false);
  const [lastUser, setLastUser] = useState<string | null>(null);

  const { user } = useUser();

  const connectSocket = (channelName: string) => {
    const newSocket = io("", {
      path: "/socket",
      reconnectionAttempts: 3,
      reconnectionDelay: 1000,
      transports: ["websocket"]
    });
    
    newSocket.on("connect_error", (error) => {
      console.error("Erro ao conectar ao socket:", error.message);
      console.error("Detalhes do erro:", error);
    });

    newSocket.on("connect", () => {
      setSocket(newSocket);
      setChannelName(channelName);
      console.log("Conexão com o socket estabelecida");
  
      newSocket.emit("joinChannel", { channelId: channelName });
  
      newSocket.on("audioData", (data: { audio: ArrayBuffer; username: string }) => {
        console.log("Audio (chunk) recebido no Canal");
        playAudio(data.audio);
      });
  
      newSocket.on("userTalking", (data: { channelId: string; username: string; state: boolean }) => {
        setIsTalking(data.state);
        setLastUser(data.state ? data.username : null);
      });
    });
  
    newSocket.on("connect_error", (error) => {
      console.error("Erro ao conectar ao socket:", error);
    });
  };
  

  const disconnectSocket = () => {
    if (socket) {
      socket.emit("leaveChannel", { channelId: channelName });
      socket.disconnect();
      setSocket(null);
      setChannelName("");
      console.log("Usuário foi desconectado do Canal");
    }
  };

  const sendAudio = (audio: ArrayBuffer) => {
    if (socket && user) {
      socket.emit("audioData", {
        channelId: channelName,
        audio,
        username: user.name,
      });
      console.log("Audio (chunk) enviado");
    }
  };

  const playAudio = (audioData: ArrayBuffer) => {
    const audioContext = new AudioContext();
    audioContext.decodeAudioData(audioData, (buffer) => {
      const source = audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContext.destination);
      source.start();
    });
  };

  const StartTalking = () => {
    if (socket && user) {
      socket.emit("userTalking", {
        channelId: channelName,
        username: user.name,
        state: true,
      });
    }
  };

  const StopTalking = () => {
    if (socket && user) {
      socket.emit("userTalking", {
        channelId: channelName,
        username: user.name,
        state: false,
      });
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        connectSocket,
        disconnectSocket,
        sendAudio,
        isTalking,
        setIsTalking,
        lastUser,
        StartTalking,
        StopTalking,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
