import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

const tokenAPI = 'BQAHKW0x0ztAf6vXu2OHLIUN5_Fn8psWhYtuUmme_wn_Fe44p_s5JB6EtT58jgKyK3Z0qWKXrX5WLbVEb4dbjTKNmdmx-CrQ6L_VsrzmOZ5YM4q0k94OPOtqXQf2wt5pFfcgb1v4_LKT4wNQHqKP';

class TrackImg extends Component {
    
    render() {
      if (!this.props.track || !this.props.track.album) return null;
  
      const images = this.props.track.album.images;
      if (!images || !images.length) return null;
  
      const src = images[0].url;
      return <img src={src} style={{ width: 400, height: 400 }} />;
    }
  }

class App extends Component {

  constructor() {
    super();
    this.state = {
      text: "Bonjour",
      response: "",
      index: 1,
      precedent: "None",
      following: "",
      currentTrackId: 0,
    };
  }
   
   
  componentDidMount() {
    fetch('https://api.spotify.com/v1/me/tracks', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + tokenAPI,
      },
    })
      .then(
        response => response.json()
      ) 
      .then((response) => {
        console.log(response)
        this.setState({text: response.items.length + " Son chargés!", response: response })
        this._startNewSong()
       })
  }
  
  _startNewSong = () => {
    this.setState({ index: Math.floor(Math.random() * this.state.response.items.length)})
    var index = this.state.index
    console.log(index)
    var currentTrack = this.state.response.items[index].track
    
    
    var previewIndex = index > 0 ? index - 1 : this.state.response.total - 1
    this.setState({precedent: this.state.response.items[previewIndex].track.name})
    var followIndex = (index + 1) % this.state.response.total
    this.setState({following: this.state.response.items[followIndex].track.name})
    
    this._playSound(currentTrack.preview_url);
    console.log("playing " + currentTrack.name + " from " + currentTrack.artists[0].name)
  }

  _playSound = (url) => {
    this.audio = new Audio(url);
    this.audio.play()
  }

  render() {
    if (!this.state.response.total) { 
    //  return( <ActivityIndicator size="large" color="#0000ff" /> )
      return("Waiting")
    }

    const index = this.state.index
    const currentTrack = this.state.response.items[index].track

    return (
     <div className="App">
       <h3> {"precedent : " + this.state.precedent } </h3>
       <h3> { "following : " + this.state.following } </h3>
       <h3> { currentTrack.name } </h3>
       <TrackImg track = { currentTrack } />
     </div>
);
  }
}

export default App;
