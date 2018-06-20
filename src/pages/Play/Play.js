import React, { Component } from 'react';
import './Play.css';
import queryString from 'query-string';
import Sound from 'react-sound';
import io from 'socket.io-client';

import ButtonChoice from './ButtonChoice';
import TrackImg from './TrackImg';

var trackList = null
var socket = null

class App extends Component {

  constructor() {
    super();
    this.state = {
      songsData: null,
      soundStatus: Sound.status.STOPPED,
      soundButtonText: "Ready !",
      gameState: 'waitingPlayer',
      answer: false,
      timer: 5
    };
  }
   
  componentDidMount() {
    console.log("DidMount !!")

    let parse = queryString.parse(window.location.search)
    let accessToken = parse.access_token

    if (!accessToken)
      return

    fetch('https://api.spotify.com/v1/me/tracks', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + accessToken,
      },
    })
      .then(
        response => response.json()
      ) 
      .then((response) => {
        console.log(response)
        if (response.total) {

          trackList = response
          this.setState({gameState: "waitingPlayer"})

          var URL = 'https://blind-spotify-backend.herokuapp.com:80'
          socket = io(URL);

          // Listen if client is chosen to pick a song
          socket.on('pick', () => {
            var songsData = this._chooseRandomTracks()
            socket.emit('pick', songsData)
          })

          // Listen for songs choices
          socket.on('play', (songsData) => {
            console.log('Playing !')
            this._startSong(songsData)
          })
        }
      })
  }

  _chooseRandomTracks() {
    console.log('Picking !')
    // Pick 3 distinct random track
    var indexPool = []
    for (let i = 0; i < trackList.items.length; i++) {
      indexPool[i] = i
    }
    var chosenTrackIndex = []
    for (let i = 0; i < 3; i++) {
      var randomIndex = Math.round(Math.random() * (indexPool.length - 1))
      
      chosenTrackIndex[i] = indexPool[randomIndex]
      indexPool[randomIndex] = indexPool.pop() // Replace chosen index with last element
    }

    // Copy chosen tracks
    var chosenTracks = []
    for (let i = 0; i < 3; i++) {
      chosenTracks[i] = trackList.items[chosenTrackIndex[i]].track
    }

    // Choose right answer
    var rightChoice = Math.round(Math.random() * (chosenTrackIndex.length - 1))

    var songsData = {
      chosenTracks: chosenTracks,
      rightChoice: rightChoice
    }

    return songsData
  }

  // Start playing
  _startSong = (songsData) => {
    // Listening for other player choice
    socket.on('otherAnswer', (buttonIndex) => {
      this._onAnswerPicked(buttonIndex)
    })

    // Start song
    this.setState({gameState: "choosing", songsData:songsData, pickedIndex: null, soundStatus:Sound.status.PLAYING, soundButtonText: "Pause"})
  }

  // Player ready to play
  _onReady = () => {
    socket.emit('ready', this.state.songsData)
    this.setState({gameState: 'isReady'})
  }

  _playSong = () => {
    this.setState({soundStatus:Sound.status.PLAYING, soundButtonText: "Pause !"})
  }

  _pauseSong = () => {
    this.setState({soundStatus:Sound.status.PAUSED, soundButtonText: "Play !"})
  }

  _onLoading = (info) => {
    console.log('Duration loaded' + info.duration)
  }

  _onFinish = () => {
    this.setState({soundStatus:Sound.status.STOPPED, soundButtonText: "Replay ?"})
  }

  // When user select an answer
  _onChoose = (buttonIndex) => {
    // Inform server of client choice
    socket.emit('answer', buttonIndex)

    socket.on('answer', (buttonIndex) => {
      this._onAnswerPicked(buttonIndex)
    })
  }

  _onAnswerPicked = (buttonIndex) => {
    var answer
    if (buttonIndex === this.state.songsData.rightChoice)
      answer = true
    else 
      answer = false
    
    this.setState({
      answer: answer, 
      gameState: 'chosen', 
      pickedIndex: buttonIndex, 
      timer: 5
    })
    this.intervalId = setInterval(() => {this._timer()}, 1000)
  }

  _timer() {
    console.log("Timer count")
    
    this.setState({timer: this.state.timer - 1})

    if (this.state.timer === 0) {
      console.log("clear")
      clearInterval(this.intervalId);
      socket.emit('ready')
    }
  }
  
  render() {
    if (!trackList || trackList.items.length < 3 )
      return (
        <div className="App"> You need at least 3 Tracks in your Spotify to play </div>);

    return (
      <div className="App">
{/* Choices button */}
        {(this.state.gameState === "choosing" || this.state.gameState === "chosen") &&
        <div>
          {this.state.songsData.chosenTracks.map((track, i) => 
            <ButtonChoice 
              key = {i}
              buttonIndex = {i}
              state = {this.state.gameState} 
              track = {this.state.songsData.chosenTracks[i]} 
              isRightChoice = {i === this.state.songsData.rightChoice}
              isPicked = {i === this.state.pickedIndex}
              callback = {this._onChoose} 
            />)
          }
        </div>
        }
{/* Song player button */}
        <h2 display = 'inline-block'>
          {
            this.state.gameState === 'isReady' 
            ? "Waiting for an adversary"
            : <a onClick={ () =>
              {
                if (this.state.gameState === 'waitingPlayer')
                  this._onReady()
                else if (this.state.gameState === 'choosing') {
                  if (this.state.soundStatus === Sound.status.PLAYING)
                    this._pauseSong()
                  else
                    this._playSong()
                }
              }}
              className='Button'
              style={{padding:'10px 50px 10px 50px'}}>
              {this.state.soundButtonText}
            </a>
          }
        </h2>
        <h2>
          {
            this.state.gameState === 'chosen' &&
            <svg version="1.1" id="L9" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
              viewBox="0 0 100 100" enableBackground="new 0 0 0 0" xmlSpace="default">
              <path fill="#000" d="M73,50c0-12.7-10.3-23-23-23S27,37.3,27,50 M30.9,50c0-10.5,8.5-19.1,19.1-19.1S69.1,39.5,69.1,50">
                <animateTransform 
                  attributeName="transform" 
                  attributeType="XML" 
                  type="rotate"
                  dur="1s" 
                  from="0 50 50"
                  to="360 50 50" 
                  repeatCount="indefinite" />
              </path>
              <text x="45" y="55">{this.state.timer}</text>
            </svg>
          }
        </h2>
{/* Player */}
        {(this.state.gameState === 'choosing' || this.state.gameState === 'chosen') &&
        <div>
        <TrackImg track = { this.state.songsData.chosenTracks[this.state.songsData.rightChoice] } />
        <Sound
          url = { this.state.songsData.chosenTracks[this.state.songsData.rightChoice].preview_url }
          onLoading={this._onLoading}
          playStatus={this.state.soundStatus}
          onFinishedPlaying={this._onFinish}
        />
        </div>
        }
      </div>
    );
  }
}

export default App;
