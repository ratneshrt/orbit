import express from 'express'
import cors from 'cors'
import { Server } from 'socket.io'
import { createServer } from 'http'

interface Room{
  roomId: string
  videoId: string | null
  currentTime: number
  isPlaying: boolean
  users: Record<string, { name: string }>
}

const app = express()
const server = createServer(app)
app.use(express.json())
app.use(cors())
const io = new Server(server, {
  cors: {
    origin: "*"
  }
})

const rooms: Record<string, Room> = {}

const generateRoomId = (length: number) => {
  const chars = "1234567890qwertyuiopasdfghjklzxcvbnm"
  let res = ''
  for (let i =0; i< length; i++){
    res += chars[Math.floor(Math.random() * chars.length)]
  }
  return res
}

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to orbit"
  })
})

app.post('/create-room', (req, res) => {
  const roomId = generateRoomId(4)
  rooms[roomId] = {
    roomId,
    videoId: null,
    currentTime: 0,
    isPlaying: false,
    users: {}
  }

  return res.status(200).json({
    roomId
  })
})

io.on("connection", (socket) => {
  console.log(`New client connect: `, socket.id)

  socket.on("joinRoom", ({ roomId, name }) => {
    console.log(`${name} is trying to join the room ${roomId}`)

    if(!rooms[roomId]){
      socket.emit("joinError", { message: "Room does not exists" })
      return
    }

    rooms[roomId].users[socket.id] = { name }
    socket.join(roomId)
    socket.emit("roomData", { videoId: rooms[roomId].videoId, currentTime: rooms[roomId].currentTime, isPlaying: rooms[roomId].isPlaying })

    io.to(roomId).emit("userList", Object.values(rooms[roomId].users))
  })

  socket.on("setVideo", ({ roomId, videoId }) => {
    const room = rooms[roomId]
    
    if (!room){
      return
    }

    room.videoId = videoId
    room.currentTime = 0
    room.isPlaying = false

    io.to(roomId).emit("setVideo", { videoId })
  })

  socket.on("play", ({ roomId, currentTime }) => {
    const room = rooms[roomId]
    if(!room){
      return
    }

    room.currentTime = currentTime
    room.isPlaying = true

    io.to(roomId).emit("play", { currentTime })
  })

  socket.on("pause", ({ roomId, currentTime }) => {
    const room = rooms[roomId]

    if(!room){
      return
    }

    room.currentTime = currentTime
    room.isPlaying = false

    io.to(roomId).emit("pause", { currentTime })
  })

  socket.on("seek", ({ roomId, currentTime }) => {
    const room = rooms[roomId]

    if(!room){
      return 
    }

    room.currentTime = currentTime
    
    io.to(roomId).emit("seek", { currentTime })
  }) 

  socket.on("chatMessage", ({ roomId, message }) => {
    const room = rooms[roomId]
    const user = room.users[socket.id]

    if(!room || !user){
      return
    }

    io.to(roomId).emit("chatMessage", { name: user.name, message, timestamp: Date.now() })
  })

  socket.on("disconnect", () => {
    console.log(`Client disconneted: `, socket.id)

    for (const roomId in rooms){
      const room = rooms[roomId]

      if(room.users[socket.id]){
        delete room.users[socket.id]
      }

      if(Object.keys(room.users).length === 0){
        console.log(`Cleaning up the room ${roomId}`)
        delete rooms[roomId]
      }

      else{
        io.to(roomId).emit("userList", Object.values(room.users))
      }
    }
  })

})

server.listen(4000, () => {
  console.log('Server listening on port: 4000')
})
