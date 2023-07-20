const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173',
    }
});

let connected_users = []

io.on('connection', (socket) => {
  // Keep track of the users connected to the server
  connected_users.push(socket.id)
  io.to(socket.id).emit("init user", socket.id)
  // Emit 
  io.emit('user_has_logged_in', connected_users.length)
  // msg[body, socketid]
  // using socket broadcast to emit to other clients without emitting to self
  socket.on('chat message', (msg) => {
    socket.broadcast.emit('chat message', msg[0])
  })
  socket.on('disconnect', () => {
    let user_index = connected_users.indexOf(socket.id)
    connected_users.splice(
        user_index,
        1
    )
    io.emit('user_has_logged_in', connected_users.length)
    console.log('disconnect')
  })
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});