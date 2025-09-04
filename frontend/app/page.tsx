"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

export default function(){
  const [roomId, setRoomId] = useState("")
  const [name, setName] = useState("")
  const router = useRouter()

  const createRoom = async () => {
    if(!name.trim()){
      alert("Please enter your name")
      return
    }

    const res = await fetch("http://localhost:4000/create-room", {
      method: "POST"
    })

    const data = await res.json()
    localStorage.setItem(`name-${data.roomId}`, name.trim())
    router.push(`/room/${data.roomId}`)
  }

  const joinRoom = () => {
    if (!roomId.trim()){
      alert("Please enter rooom ID")
      return 
    }

    if(!name.trim()){
      alert("Please enter your name")
      return
    }

    localStorage.setItem(`name-${roomId}`, name.trim())
    router.push(`/room/${roomId.trim()}`)
  }

  return (
    <>
      <main className="h-screen w-full flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-neutral-900 rounded-2xl p-6 shadow-xl">
        <h1 className="text-2xl font-bold mb-6 text-center">Welcome to Orbit!</h1>

        <label className="block text-sm mb-2">Your Name</label>
        <input
          className="w-full rounded-lg bg-neutral-800 px-3 py-2 mb-4 outline-none border border-neutral-700"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="fearless-cat"
        />

        <label className="block text-sm mb-2">Room ID (if joining)</label>
        <input
          className="w-full rounded-lg bg-neutral-800 px-3 py-2 mb-6 outline-none border border-neutral-700"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          placeholder="snob"
        />

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={createRoom}
            className="rounded-xl bg-emerald-600 hover:bg-emerald-500 py-2 font-semibold"
          >
            Create Room
          </button>
          <button
            onClick={joinRoom}
            className="rounded-xl bg-blue-600 hover:bg-blue-500 py-2 font-semibold"
          >
            Join Room
          </button>
        </div>
      </div>
    </main>
    </>
  )
}