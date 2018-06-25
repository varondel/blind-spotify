const express = require('express');
const socketIO = require('socket.io');

var RoomUtils = require('./roomUtils');
var roomUtils = new RoomUtils()

const PORT = process.env.PORT || 3006;

const server = express()
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));

const io = socketIO(server);

// Quand un client se connecte, on le note dans la console
io.sockets.on('connection', function (socket) {
  console.log('Un client est connecté !');

  roomUtils.addPlayer(socket)

  socket.on('ready', function() {
    roomUtils.onPlayerReady(socket)
  })

  socket.on('answer', function(data) {
    console.log("Answered")
    roomUtils.onPlayerAnswer(socket)
  })

});