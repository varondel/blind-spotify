import React, { Component } from 'react';
import './Login.css';

class Login extends Component {
   
  render() {

    return (
    <div className="App">
        <a 
        type="button"
        onClick = { ()=> {
            window.location= window.location.href.indexOf("localhost") > -1 
            ? 'http://localhost:8888/login' 
            : 'http://blind-spotify-backend.herokuapp.com/login'
          }}
          className='Button'
          style={{padding:'10px 50px 10px 50px', fontWeight: '700', letterSpacing: '2px'}}>
          SIGN IN TO SPOTIFY </a>
    </div>
    );
  }
}

export default Login;
