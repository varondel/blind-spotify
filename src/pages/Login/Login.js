import React, { Component } from 'react';
import './Login.css';

class Login extends Component {
   
  render() {

    return (
    <div className="App">
        <button onClick = { ()=> {
            window.location= window.location.href.indexOf("localhost") > -1 
            ? 'http://localhost:8888/login' 
            : 'http://blind-spotify-backend.herokuapp.com/login'
          }}
          style={{padding:'10px', 'fontSize':'40px', backgroundColor: 'black', color: 'white'}
        }> Sign in to spotify </button>
    </div>
    );
  }
}

export default Login;
