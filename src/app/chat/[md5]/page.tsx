'use client';

import Mic from "@/app/components/Mic";
import { useSocket } from "@/app/context/Socket";
import { useUser } from "@/app/context/User";
import { Response_md5 } from "@/app/interface/Md5";
import { api_md5 } from "@/app/proxy/proxy";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import { audioContext } from "@/app/context/Socket";
type Params = Promise<{ md5: string }>;

export default function ChatPage({params}: {params: Params}) {
    const resolvedParams = use(params);
    const md5Value = resolvedParams.md5;

    const [md5, setMd5] = useState<Response_md5 | null>(null);
    const [start, setStart] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [isMicActive, setIsMicActive] = useState(false);
    const { connectSocket, disconnectSocket, audioContext, handleAudioContext, isTalking, lastUser } = useSocket();
    const { idUser } = useUser();
    const router = useRouter();

    const getChannelMd5 = async () => {
        try {
            const response = await api_md5(`/${md5Value}`);
            const data: Response_md5 = response.data;
            setMd5(data);
            setHasError(false);
            idUser(data);
            connectSocket(data.Value.NmCanal);
        } catch {
            setHasError(true);
        } finally {
            setIsLoading(false);
        }
    }

    const handleDisconnect = () => {
        disconnectSocket();
        router.push("/");
    }

    const handleStart = () => {
        setStart(!start);
        if (!audioContext){
            handleAudioContext();
        }
    }
    
    useEffect(() => {
        if (md5Value) {
            getChannelMd5();
        }
    }, [md5Value]);

    return (
        <div>
            {!start ? 
                (
                    <div className="relative mx-auto flex h-32 w-80 flex-col gap-4 rounded border bg-white p-4 shadow-2xl">
                        <div className="flex flex-row items-center justify-center gap-8 text-2xl">
                            <h2>Bem vindo ao Talkie</h2>
                            <i className="fa-solid fa-headset animate-pulse"></i>
                        </div>
                        <button
                            onClick={handleStart}
                            className="rounded bg-blue-500 p-2 text-white hover:bg-blue-600"
                        >
                            Iniciar
                        </button>
                    </div>
                ) 
                : 
                (
                    <div className="flex h-screen w-full items-center justify-center">
                        <div className="flex flex-col gap-8">
                            {isLoading ? 
                                (
                                    <div>
                                        <i className="fa-solid fa-spinner fa-spin-pulse mx-auto w-fit text-center text-6xl"></i>
                                    </div>

                                )
                                :
                                (
                                    hasError ? 
                                    (
                                        <p className="text-center text-2xl text-red-500">
                                            Conexão falhou
                                        </p>
                                    )
                                    :
                                    (
                                        <div className="relative mx-auto flex w-60 flex-col gap-6 rounded border bg-white p-4 shadow-2xl">
                                            <h1 className="mb-4 rounded border border-gray-200 bg-gray-200 p-2 text-center text-2xl">
                                                {md5?.Value.NmEmpresa}
                                            </h1>
                                            <p className="text-center text-sm">{md5?.Value.NmUsuario}</p>

                                            <Mic
                                                isMicActive={isMicActive}
                                                setIsMicActive={setIsMicActive}
                                            />
                                            <button
                                                onClick={handleDisconnect}
                                                className="rounded bg-blue-500 p-2 text-white hover:bg-blue-600"
                                                >
                                                Desconectar
                                            </button>
                                        </div>
                                    )
                                )
                            }
                            {isTalking && 
                                (
                                    <div className="flex items-center justify-center gap-2">
                                        <p className="text-lg">{lastUser}</p>{" "}
                                        <i className="fa-solid fa-volume-high animate-pulse text-3xl"></i>
                                    </div>
                                )
                            }
                        </div>
                    </div>
                )
            }
        </div>
    )
}