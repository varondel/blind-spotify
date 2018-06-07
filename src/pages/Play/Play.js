import React, { Component } from 'react';
import './Play.css';
import queryString from 'query-string';
import Sound from 'react-sound';

var trackList = null
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
          class='Button'
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
      soundButtonText: "Play !",
      gameState: 'choosing'
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
            //this.setState({response: response })
            trackList = response
            this._chooseRandomTracks()
        }
      })
  }

  _chooseRandomTracks = () => {
    //Pick 3 distinct random track
    var indexPool = []
    for (var i = 0; i < trackList.items.length; i++) {
      indexPool[i] = i
    }
    var chosenTrackIndex = []
    for (i = 0; i < 3; i++) {
      var randomIndex = Math.round(Math.random() * (indexPool.length - 1))
      
      chosenTrackIndex[i] = indexPool[randomIndex]
      indexPool[randomIndex] = indexPool.pop() //Replace chosen index with last element
    }

    //Choose right answer
    var rightChoice = Math.round(Math.random() * (chosenTrackIndex.length - 1))

    //Update buttons
    this.setState({
      gameState: "choosing",
      tracksChoice: chosenTrackIndex, 
      rightChoice: rightChoice
    })
  }

  _startSong = () => {
    this.setState({soundStatus:Sound.status.PLAYING, soundButtonText: "Pause"})
  }

  _pauseSong = () => {
    this.setState({soundStatus:Sound.status.PAUSED, soundButtonText: "Play !"})
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
        <h3> Which song is it ? </h3>
        <div style={{display: 'inline-block'}}>
          <ButtonChoice 
            buttonIndex = "0"
            state = {this.state.gameState} 
            track = {trackList.items[this.state.tracksChoice[0]].track} 
            choice = {0 === this.state.rightChoice}
            callback = {this._onChoose}/>
          <ButtonChoice
            buttonIndex = "1"
            state = {this.state.gameState}
            track = {trackList.items[this.state.tracksChoice[1]].track}
            choice = {1 === this.state.rightChoice}
            callback = {this._onChoose}/>
          <ButtonChoice
            buttonIndex = "2"
            state = {this.state.gameState}
            track = {trackList.items[this.state.tracksChoice[2]].track}
            choice = {2 === this.state.rightChoice}
            callback = {this._onChoose}/>
        </div>
        <h2 display = 'inline-block'><a onClick={()=>
          {
            if(this.state.soundStatus === Sound.status.PLAYING)
              this._pauseSong()
            else
              this._startSong()
          }}
          class='Button'
          style={{padding:'10px 50px 10px 50px'}}>
          {this.state.soundButtonText}
        </a></h2>
        {this.state.gameState === "chosen" &&
        <h2 display = 'inline-block'><a onClick={()=>
          {
            this._chooseRandomTracks()
          }}
          class='Button'
          style={{padding:'10px 50px 10px 50px'}}>
          Next song !
        </a></h2>
        }
        <TrackImg track = { trackList.items[this.state.tracksChoice[this.state.rightChoice]].track } />
        <Sound
          url = {trackList.items[this.state.tracksChoice[this.state.rightChoice]].track.preview_url}
          playStatus={this.state.soundStatus}
          onFinishedPlaying={this._onFinish}
        />
      </div>
    );
  }
}

export default App;
