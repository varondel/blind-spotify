import React, { Component } from 'react';

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

const _default = TrackImg;
export { _default as default };