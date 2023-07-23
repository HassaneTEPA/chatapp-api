const express = require('express');
const app = express();
const http = require('http');
const { connected } = require('process');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173',
    }
});

let connected_users = []

function get_user_index (socket_id) {
    return connected_users.findIndex(cuser => cuser.id === socket_id)
}

io.on('connection', (socket) => {
  // Keep track of the users connected to the server
  connected_users.push({id: socket.id, name: null})
  io.to(socket.id).emit("init user", socket.id)
  // Emit 
  io.emit('user_has_logged_in', connected_users.length)
  // msg[body, socketid]
  // using socket broadcast to emit to other clients without emitting to self
  socket.on('chat message', (msg) => {
    console.log(connected_users[get_user_index(msg[socket.id])])
    socket.broadcast.emit('chat message', [msg[0], connected_users[get_user_index(socket.id)].name])
  })
  socket.on('change_username', (username) => {
    let cuser_index = get_user_index(socket.id)
    if (cuser_index !== -1) {
        connected_users[cuser_index].name = username
    }
  })
  socket.on('disconnect', () => {
    let user_index = get_user_index(socket.id)
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