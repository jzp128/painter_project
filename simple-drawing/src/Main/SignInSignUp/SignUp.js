import React, {Component} from "react";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import TextField from "@material-ui/core/TextField";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";


export default class SignUp extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return <>
      <DialogTitle id="form-dialog-title">Sign Up</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Sign Up By Entering your with your Email and Password and Username
        </DialogContentText>
        <form id="signUpForm" onSubmit={this.props.handleSubmit}>
          <TextField
            autoFocus
            margin="dense"
            id="emailSignUp"
            label="Email Address"
            type="email"
            fullWidth
          />
          <TextField
            autoFocus
            margin="dense"
            id="userNameSignUp"
            label="User Name"
            type="text"
            fullWidth
          />
          <TextField
            autoFocus
            margin="dense"
            id="passwordSignUp"
            label="Password"
            type="password"
            fullWidth
          />

        </form>
        <Button onClick={event => this.props.handleModeChange(event, "signin")}>Sign In</Button>
      </DialogContent>
      <DialogActions>
        <Button onClick={this.props.handleClose} color="primary">
          Cancel
        </Button>
        <Button onClick={this.props.handleSubmit} color="primary">
          Sign Up
        </Button>
      </DialogActions>
    </>
  }
}

