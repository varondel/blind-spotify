class Room {

    constructor(socket) {
        console.log('Room created !');
        this.players = new Array()
        this.isFull = false
        this.playerReady = 0
        this.gameState = "waiting"
        this.round = 1
    }

    askForSong() {
        this.chooser = this.players[this.round % this.players.length]
        console.log("Emit Pick")
        this.chooser.emit('pick', '')
        this.chooser.on('pick', (songData) => {
            this.players[0].emit('play', songData)
            this.players[1].emit('play', songData)
            this.gameState = "playing"
            this.round += 1
        })
    }

    addPlayer(socket) {
        this.players.push(socket)
        console.log('Player Added')

        if (this.players.length == 2) {
            console.log('this room is now full')
            this.isFull = true
        }
    }

    roomIsFull() {
        if (this.players.length == 2) {
            this.isFull = true
        }
        return this.isFull
    }

    setReady(socket) {
        this.playerReady += 1
        console.log('Player Ready ' + this.playerReady)
        if (this.playerReady == 2) {
            this.askForSong()
            this.playerReady = 0
        }
    }

    playerAnswer(socket, data) {
        console.log("Answered_2")
        if (this.gameState != "playing")
            return

        console.log("Answered_3")
        if (socket.id == this.players[0].id) {
            this.players[0].emit("answer", data)
            this.players[1].emit("otherAnswer", data)
        }
        else if (socket.id == this.players[1].id) {
            this.players[1].emit("answer", data)
            this.players[0].emit("otherAnswer", data)
        }

        this.gameState = "waiting"
    }
    
}
module.exports = Room;