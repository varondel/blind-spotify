import React, { Component } from 'react';
import './Play.css';
import queryString from 'query-string';
import Sound from 'react-sound';

import openSocket from 'socket.io-client';


var trackList = null
var socket = null

const buttonStyleList = {
  'default': {backgroundColor: 'black'},
  'wrong':{backgroundColor: 'red'},
  'correct':{backgroundColor: 'green'}
}

class TrackImg extends Component {
    render() {
      if (!this.props.track || !this.props.track.album) return null;
  
      const images = this.props.track.album.images;
      if (!images || !images.length) return null;
  
      const src = images[0].url;
      //eslint-disable-next-line
      return <img src={src} alt="no image" style={{ width: 400, height: 400 }} />;
    }
  }

  class ButtonChoice extends Component {
    render() {
      var buttonStyle = {}
      if (this.props.state === "choosing")
        buttonStyle = buttonStyleList.default
      else
        buttonStyle = this.props.choice ? buttonStyleList.correct : buttonStyleList.wrong

      return(
        <h3 style={{display: 'inline-block'}}><a 
          type="button"
          onClick={()=> {this.props.callback(this.props.buttonIndex)}}
          className='Button'
          style={{...buttonStyle, padding:'10px 50px 10px 50px'}}>
          {this.props.track.name}
        </a></h3>
      )
    }
  }


class App extends Component {

  constructor() {
    super();
    this.state = {
      tracksChoice: [],
      rightChoice: 0,
      soundStatus: Sound.status.STOPPED,
      soundButtonText: "Ready !",
      gameState: 'choosing',
      answer:false
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
          this.setState({gameState: "waiting"})

          socket = openSocket('http://localhost:8888');

          socket.on('pick', () => {
            var songsData = this._chooseRandomTracks()
            socket.emit('pick', songsData)
          })

          socket.on('play', (songsData) => {
            console.log('Playing !')
            this._startSong(songsData)
          })
        }
      })
  }

  _chooseRandomTracks() {
    console.log('Picking !')
    //Pick 3 distinct random track
    var indexPool = []
    for (let i = 0; i < trackList.items.length; i++) {
      indexPool[i] = i
    }
    var chosenTrackIndex = []
    for (let i = 0; i < 3; i++) {
      var randomIndex = Math.round(Math.random() * (indexPool.length - 1))
      
      chosenTrackIndex[i] = indexPool[randomIndex]
      indexPool[randomIndex] = indexPool.pop() //Replace chosen index with last element
    }

    //Copy chosen tracks
    var chosenTracks = []
    for (let i = 0; i < 3; i++) {
      chosenTracks[i] = trackList.items[chosenTrackIndex[i]].track
    }

    //Choose right answer
    var rightChoice = Math.round(Math.random() * (chosenTrackIndex.length - 1))

    var songsData = {
      chosenTracks: chosenTracks,
      rightChoice: rightChoice
    }

    //Update buttons
    this.setState({
      tracksChoice: chosenTrackIndex,
      rightChoice: rightChoice,
      songsData: songsData
    })

    return songsData
  }

  // Song player button callbacks
  _startSong = (songsData) => {
    this.setState({gameState: "choosing", songsData:songsData, soundStatus:Sound.status.PLAYING, soundButtonText: "Pause"})
  }

  _onReady = () => {
    socket.emit('ready', this.state.songsData)
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

  //When user select an answer
  _onChoose = (buttonIndex) => {
    if (buttonIndex === this.state.rightChoice)
      this.setState({answer: true, gameState: 'chosen'})
    else 
      this.setState({answer: false, gameState: 'chosen'})
  }
  
  render() {
    if (!trackList || trackList.items.length < 3 )
      return (
        <div className="App"> You need at least 3 Tracks in your Spotify to play </div>);

    return (
      <div className="App">
        <h3> {
          this.state.gameState === "choosing" 
          ? "Which song is it ?" 
          : (
            this.state.answer === true ? "Bravo !" : "Raté !"
          )
          } </h3>
        {this.state.gameState === "choosing" &&
        <div>
          <ButtonChoice 
            buttonIndex = {0}
            state = {this.state.gameState} 
            track = {this.state.songsData.chosenTracks[0]} 
            choice = {0 === this.state.rightChoice}
            callback = {this._onChoose}/>
          <ButtonChoice
            buttonIndex = {1}
            state = {this.state.gameState}
            track = {this.state.songsData.chosenTracks[1]}
            choice = {1 === this.state.rightChoice}
            callback = {this._onChoose}/>
          <ButtonChoice
            buttonIndex = {2}
            state = {this.state.gameState}
            track = {this.state.songsData.chosenTracks[2]}
            choice = {2 === this.state.rightChoice}
            callback = {this._onChoose}/>
        </div>
        }
{/* Song player button */}
        <h2 display = 'inline-block'><a onClick={()=>
          {
            /*if(this.state.soundStatus === Sound.status.PLAYING)
              this._pauseSong()
            else
              this._startSong()*/
            this._onReady()
          }}
          className='Button'
          style={{padding:'10px 50px 10px 50px'}}>
          {this.state.soundButtonText}
        </a></h2>
{/* Next song button appears onyl after user chosed an answer */}
        {this.state.gameState === "chosen" &&
        <h2 display = 'inline-block'><a onClick={()=>
          {
            this._chooseRandomTracks()
          }}
          className='Button'
          style={{padding:'10px 50px 10px 50px'}}>
          Next song !
        </a></h2>
        }
        {this.state.gameState !== "waiting" &&
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
