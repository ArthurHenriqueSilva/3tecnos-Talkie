"use client";
import { useCallback, useEffect, useRef } from "react";

import { useSocket } from "../context/Socket";

type MicProps = {
  isMicActive: boolean;
  setIsMicActive: (active: boolean) => void;
};

export default function Mic({ isMicActive, setIsMicActive }: MicProps) {
  const { sendAudio, StartTalking, StopTalking } = useSocket();
  
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);

  const startRecordingChunk = useCallback(() => {
    if (!mediaStreamRef.current) return;

    const mediaRecorder = new MediaRecorder(mediaStreamRef.current);

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        event.data.arrayBuffer().then((audioBuffer) => {
          sendAudio(audioBuffer);
        });
      }
    };

    mediaRecorder.start();
    setTimeout(() => mediaRecorder.stop(), 500);
  }, [sendAudio]);

  const startContinuousRecording = useCallback(() => {
    const getUserMedia = navigator.mediaDevices.getUserMedia.bind(
      navigator.mediaDevices,
    );

    if (getUserMedia) {
      getUserMedia({ audio: true })
        .then((stream) => {
          mediaStreamRef.current = stream;
          intervalIdRef.current = setInterval(startRecordingChunk, 500);
        })
        .catch((error) => {
          console.error(
            "Error ao acessar dispositivos de media (media devices).",
            error,
          );
        });
    } else {
      console.error("getUserMedia não está disponível neste navegador.");
    }
  }, [startRecordingChunk]);

  const stopContinuousRecording = useCallback(() => {
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (isMicActive) {
      StartTalking();
      startContinuousRecording();
    } else {
      StopTalking();
      stopContinuousRecording();
    }

    return () => {
      stopContinuousRecording();
    };
  }, [isMicActive, startContinuousRecording, stopContinuousRecording]);

  const handleMicMouseDown = () => setIsMicActive(true);
  const handleMicMouseUp = () => setIsMicActive(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "k") {
        setIsMicActive(true);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "k") {
        setIsMicActive(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [setIsMicActive]);

  return (
    <button
      onMouseDown={handleMicMouseDown}
      onMouseUp={handleMicMouseUp}
      className="text-5xl"
    >
      {isMicActive ? (
        <i className="fa-solid fa-microphone animate-pulse text-green-500"></i>
      ) : (
        <i className="fa-solid fa-microphone-slash"></i>
      )}
    </button>
  );
}
