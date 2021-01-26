import React from 'react';
import './App.css';
import 'typeface-roboto';

import DrawBoard from './Main/DrawBoard'
import {BrowserRouter as Router, Route, Switch, useHistory} from 'react-router-dom'
import SocketService from "./utils/SocketService";
import Verification from "./Main/Verification";
import Home from "./Main/Home";
import FileBrowser from "./Main/FileBrowser";

export default function App() {
  // create socket service
  let socketService = new SocketService();
  return (
    <Router>
      <div className="App">
        <Switch>
          <Route exact path='/'><Home/></Route>
          <Route exact path='/myDrawings/'><FileBrowser/></Route>
          <Router path='/verify/:verifyId'><Verification/></Router>
          <Route exact path='/canvas/'><FileBrowser/></Route>
          <Route path='/canvas/:id' component={(props) => <DrawBoard {...props} socketService={socketService}/>}/>
        </Switch>
      </div>
    </Router>
  );
}