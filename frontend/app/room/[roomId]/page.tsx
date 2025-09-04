"use client"

import { useParams } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"
import { io, Socket } from "socket.io-client"
import { extractYouTubeId } from "@/app/lib/youtube"
import { YoutubePlayer } from "@/app/components/YoutubePlayer"
import { UserList } from "@/app/components/UserList"
import { Chat } from "@/app/components/Chat"

interface User{
    name: string
}

interface RoomData{
    videoId: string | null
    currentTime: number
    isPlaying: boolean
}

export default function(){
    const { roomId } = useParams<{ roomId: string }>()
    const [socket, setSocket] = useState<Socket | null>(null)
    const [name, setName] = useState("")
    const [videoId, setVideoId] = useState<string| null>(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)
    const [users, setUsers] = useState<User[]>([])
    const [urlInput, setUrlInput] = useState("")
    const playerReadyRef = useRef(false)
    const pendingSyncRef = useRef<RoomData | null>(null)

    const storedName = useMemo(() => 
        (typeof window !== "undefined" ? localStorage.getItem(`name-${roomId}`) : null), [roomId]
    )

    useEffect(() => {
        if (storedName){
            setName(storedName)
            return
        }
        const n = window.prompt("Enter your Name")
        const finalName = n?.trim() || `User-${Math.floor(Math.random() * 1000)}`
        setName(finalName)
        localStorage.setItem(`name-${roomId}`, finalName)
    }, [roomId, storedName])

    useEffect(() => {
        const s = io("http://localhost:4000", {
            transports: ["websocket"]
        })

        setSocket(s)

        return () => {
            s.disconnect()
        }
    }, [])

    useEffect(() => {
        if(!socket || !name){
            return
        }

        socket.emit("joinRoom", { roomId, name })
    }, [roomId, name])

    useEffect(() => {
        if (!socket){
            return
        }

        const onRoomData = (data: RoomData) => {
            setVideoId(data.videoId)
            setIsPlaying(data.isPlaying)
            setCurrentTime(data.currentTime)

            if (!playerReadyRef.current){
                pendingSyncRef.current = data
            } else{

            }
        }

        const onUserList = (list: User[]) => setUsers(list)

        const onSetVideo = ({ videoId }: { videoId: string }) => {
            setVideoId(videoId)
            setIsPlaying(false)
            setCurrentTime(0)
        }

        const onPlay = ({ currentTime }: { currentTime: number }) => {
            setIsPlaying(true)
            setCurrentTime(currentTime)
        }

        const onPause = ({ currentTime }: { currentTime: number }) => {
            setIsPlaying(false)
            setCurrentTime(currentTime)
        }

        const onSeek = ({ currentTime }: { currentTime: number }) => {
            setCurrentTime(currentTime)
        }

        const onJoinError = (e: { message: string }) => alert(e.message)

        socket.on("roomData", onRoomData)
        socket.on("userList", onUserList)
        socket.on("setVideo", onSetVideo)
        socket.on("play", onPlay)
        socket.on("pause", onPause)
        socket.on("seek", onSeek)
        socket.on("joinError", onJoinError)

        return () => {
            socket.off("roomData", onRoomData)
            socket.off("userList", onUserList)
            socket.off("setVideo", onSetVideo)
            socket.off("play", onPlay)
            socket.off("pause", onPause)
            socket.off("seek", onSeek)
            socket.off("joinError", onJoinError)
        }
    }, [socket])

    const submitVideo = () => {
        if (!socket){
            return
        }

        const id = extractYouTubeId(urlInput)

        if(!id){
            alert("Invalid Youtube URL or ID")
            return
        }

        socket.emit("setVideo", { roomId, videoId: id })
        setUrlInput("")
    }

    const handlePlay = (time: number) => {
        if (!socket){
            return
        }

        socket.emit("play", { roomId, currentTime: time })
    }

    const handlePause = (time: number) => {
        if(!socket){
            return
        }

        socket.emit("pause", { roomId, currentTime: time })
    }

    const handleSeek = (time: number) => {
        if (!socket){
            return
        }

        socket.emit("seek", { roomId, currentTime: time })
    }

    const onPlayerReady = () => {
        playerReadyRef.current = true
        if(pendingSyncRef.current){
            const d = pendingSyncRef.current
            setVideoId(d.videoId)
            setIsPlaying(d.isPlaying)
            setCurrentTime(d.currentTime)
            pendingSyncRef.current = null
        }
    }

    return (
        <>
            <div>
                <div className="min-h-screen grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-4 p-4">
                <div className="space-y-4">
                    <div className="bg-neutral-900 rounded-2xl p-3 shadow-lg">
                    <YoutubePlayer
                        videoId={videoId}
                        isPlaying={isPlaying}
                        currentTime={currentTime}
                        onReady={onPlayerReady}
                        onPlay={handlePlay}
                        onPause={handlePause}
                        onSeek={handleSeek}
                    />
                    </div>

                    <div className="bg-neutral-900 rounded-2xl p-4 shadow-lg space-y-3">
                    <div className="flex items-center justify-between">
                        <h2 className="font-semibold">Room: {roomId}</h2>
                    </div>
                        <>
                        <div className="flex gap-2">
                            <input
                            className="flex-1 rounded-lg bg-neutral-800 px-3 py-2 border border-neutral-700 outline-none"
                            placeholder="Paste YouTube URL or ID"
                            value={urlInput}
                            onChange={(e) => setUrlInput(e.target.value)}
                            />
                            <button
                            onClick={submitVideo}
                            className="rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2 font-semibold"
                            >
                            Set Video
                            </button>
                        </div>
                        </>
                    </div>
                </div>

                <div className="space-y-4">
                    <UserList users={users} meName={name} />
                    <Chat socket={socket} roomId={roomId} meName={name} />
                </div>
                </div>
            </div>
        </>
    )
}