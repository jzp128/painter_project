import React, {Component} from "react";
import SignIn from "./SignIn";
import SignUp from "./SignUp";

export default class signInSignUp extends Component {
  constructor(props) {
    super(props);
  };

  render() {
    console.log(this.props.mode);
    return this.props.mode == 'signin' ?
      <SignIn handleSubmit={this.props.handleSignIn} handleClose={this.props.handleClose}
              handleModeChange={this.props.handleModeChange}/> :
      <SignUp handleSubmit={this.props.handleSignUp} handleClose={this.props.handleClose}
              handleModeChange={this.props.handleModeChange}/>

  }
}
