import React, {Component} from "react";
import './Home.css';
import Button from '@material-ui/core/Button';
import {BrowserRouter as useHistory, withRouter} from "react-router-dom";
import Dialog from "@material-ui/core/Dialog";
import SignInSignUp from "./SignInSignUp/SignInSignUp";
import {getUserName} from "../utils/utils";

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      authenticated: false,
      showModal: false,
      redirect: null,
      mode: 'signin'
    }
  }

  componentDidMount() {
    const user = getUserName();
    if(user){
      const {history} = this.props;
      history.push('/myDrawings');
    }
  }
  handleButtonClick = (e) => {
    this.setState({showModal: true});
  };

  handleModalClose = (e) => {
    this.setState({showModal: false, mode: 'signin'});
  };

  handleSubmitSignUp = (e) => {
    e.preventDefault();
    const email = document.getElementById('emailSignUp').value;
    const password = document.getElementById('passwordSignUp').value;
    const userName = document.getElementById('userNameSignUp').value;

    fetch('/signup/', {
      method: 'POST',
      headers: {'Content-type': 'application/json'},
      body: JSON.stringify({email: email, password: password, username: userName})
    }).then(
      (res) => {
        console.log('what the fu');
        this.handleModalClose(e);
      }
    );
  };

  handleSubmitSignIn = (e) => {
    e.preventDefault();
    const email = document.getElementById('signInEmail').value;
    const password = document.getElementById('signInPassword').value;
    fetch('/signin/', {
      method: 'POST',
      headers: {'Content-type': 'application/json'},
      body: JSON.stringify({email: email, password: password})
    }).then(
      (res) => {
        this.handleSignIn(res)
      }
    );
  };

  handleSignIn = (result) => {
    if (result.status === 200) {
      this.setState({showModal: false})
      const {history} = this.props;
      // REDIRECTS TO THE PAGE
      history.push('/myDrawings/');
    }
  };

  handleModeChange = (evt, mode) => {
    evt.preventDefault();
    this.setState({mode});
  };

  render() {
    const {mode} = this.state;
    return <div className="homeMain">
      <Dialog open={this.state.showModal} onClose={this.handleModalClose}>
        <SignInSignUp mode={mode} handleSignIn={this.handleSubmitSignIn} handleSignUp={this.handleSubmitSignUp}
                      handleClose={this.handleModalClose} handleModeChange={this.handleModeChange}/>
      </Dialog>
      <h1>PAINTER PROJECT</h1>
      <h2>A web based collaborative drawing program</h2>
      <div>
        <Button variant="contained" color="primary" onClick={this.handleButtonClick}> Log In / Sign Up </Button>
      </div>
    </div>
  }
}

export default withRouter(Home);