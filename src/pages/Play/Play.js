import React, { Component } from 'react';
import './Play.css';
import queryString from 'query-string';
import Sound from 'react-sound';

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

class App extends Component {

  constructor() {
    super();
    this.state = {
      text: "Bonjour",
      response: {},
      index: 1,
      precedent: "None",
      following: "",
      currentTrackId: 0,
      soundStatus: Sound.status.STOPPED,
      soundButtonText: "Play !"
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
            this.setState({response: response })
            this._chooseSong()
        }
      })
  }

  _chooseSong = () => {
    this.setState({ index: Math.floor(Math.random() * this.state.response.items.length)})
    var index = this.state.index
    console.log(index)
    
    var previewIndex = index > 0 ? index - 1 : this.state.response.total - 1
    this.setState({precedent: this.state.response.items[previewIndex].track.name})
    var followIndex = (index + 1) % this.state.response.total
    this.setState({following: this.state.response.items[followIndex].track.name})
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
  
  render() {
    if (!this.state.response.total)
    return (
      <div className="App"> No Data </div>);

    return (
      <div className="App">
        <div>
          <h3> {"precedent : " + this.state.precedent } </h3>
          <h3> { "following : " + this.state.following } </h3>
          <h3> { this.state.response.items[this.state.index].track.name } </h3>
          <h3><button onClick={()=>
            {
              if(this.state.soundStatus === Sound.status.PLAYING)
                this._pauseSong()
              else
                this._startSong()
            }}
            style={{padding:'10px', 'fontSize':'40px', backgroundColor: 'black', color: 'white'}}>
            {this.state.soundButtonText}
          </button></h3>
          <TrackImg track = { this.state.response.items[this.state.index].track } />
          <Sound
            url = {this.state.response.items[this.state.index].track.preview_url}
            playStatus={this.state.soundStatus}
            onFinishedPlaying={this._onFinish}
          />
        </div>
      </div>
    );
  }
}

export default App;
