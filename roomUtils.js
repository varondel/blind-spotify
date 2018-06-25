var room = require('./room')

class RoomUtils {

    constructor() {
        this.socketToRoom = {}
    }

    addPlayer(socket) {
        
        if (!this.rooms)
            this.rooms = new Array()
        
        if ( this.rooms.length < 1 || this.rooms[this.rooms.length - 1].roomIsFull())
            this.rooms.push(new room())

        this.rooms[this.rooms.length - 1].addPlayer(socket)
        this.socketToRoom[socket.id] = this.rooms[this.rooms.length - 1]
    }

    onPlayerReady(socket) {
        this.socketToRoom[socket.id].setReady(socket)
    }

    onPlayerAnswer(socket, data) {
        this.socketToRoom[socket.id].playerAnswer(socket, data)
    }

}
module.exports = RoomUtils;