"use client"

import { useEffect, useRef, useState } from "react"
import { Socket } from "socket.io-client"

interface RoomProps{
    socket: Socket | null
    roomId: string
    meName: string
}

interface ChatProps{
    name: string
    message: string
    timestamp: number
}

export const Chat = ({ socket, roomId, meName }: RoomProps) => {
    const [messages, setMessages] = useState<ChatProps[]>([])
    const [input, setInput] = useState("")
    const endRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if(!socket){
            return
        }

        const onMessage = (msg: ChatProps) => {
            setMessages((m) => [...m, msg])
        }
        socket.on("chatMessage", onMessage)
        return () => {
            socket.off("chatMessage", onMessage)
        }
    }, [socket])

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    const send = () => {
        if(!socket || !input.trim()){
            return
        }

        socket.emit("chatMessage", { roomId, message: input.trim() })
        setInput("")
    }

    const onKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if(e.key === "Enter"){
            send()
        }
    }

    return(
        <>
            <div className="bg-neutral-900 rounded-2xl p-4 shadow-lg h-[60vh] flex flex-col">
                <h3 className="font-semibold mb-3">Chat</h3>
                <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                    {messages.map((m, i) => (
                    <div key={i} className="text-sm">
                        <span className="font-semibold">{m.name}:</span>{" "}
                        <span className="text-neutral-300">{m.message}</span>
                        <span className="text-[10px] text-neutral-500 ml-2">
                        {new Date(m.timestamp).toLocaleTimeString()}
                        </span>
                    </div>
                    ))}
                    <div ref={endRef} />
                </div>
                <div className="mt-3 flex gap-2">
                    <input
                    className="flex-1 rounded-lg bg-neutral-800 px-3 py-2 outline-none border border-neutral-700"
                    placeholder={`Message as ${meName}`}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={onKey}
                    />
                    <button
                    onClick={send}
                    className="rounded-xl bg-blue-600 hover:bg-blue-500 px-4 py-2 font-semibold"
                    >
                    Send
                    </button>
                </div>
            </div>
        </>
    )
}