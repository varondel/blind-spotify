const express = require('express');
const socketIO = require('socket.io');
const path = require('path');
var http = require('http');

var RoomUtils = require('./roomUtils');
var roomUtils = new RoomUtils()

const PORT = process.env.PORT || 3006;

let app = express()
app.use(express.static(path.join(__dirname, 'client/build')));

var server = http.createServer(app)
const io = require('socket.io').listen(server);

// Put all API endpoints under '/api'
app.get('/test', (req, res) => {
  // Return them as json
  res.json("TEST");

  console.log(`TEST`);
});

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

server.listen(PORT, () => console.log(`Listening on ${ PORT }`));