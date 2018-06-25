import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import Login from './pages/Login/Login'
import Play from './pages/Play/Play'
import registerServiceWorker from './registerServiceWorker';
import {Router, Route, Switch} from 'react-router'
import history from './history'

ReactDOM.render(
    <Router history={history}>
        <div>
        <Route path="/" component= {App}/>
            <Switch>
            <Route path="/play" component= {Play}/>
            <Route path="/" component= {Login}/>
            </Switch>
        </div>
    </Router>, 
    document.getElementById('root'));
registerServiceWorker();
