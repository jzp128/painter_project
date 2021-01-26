import React, {Component} from "react";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import TextField from "@material-ui/core/TextField";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";

export default class SignIn extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return <>
      <DialogTitle id="form-dialog-title">Sign In</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Sign in with your Email and Password
        </DialogContentText>
        <form autoComplete="on">
          <TextField
            autoFocus
            margin="dense"
            id="signInEmail"
            label="Email Address"
            type="email"
            fullWidth
          />
          <TextField
            margin="dense"
            id="signInPassword"
            label="password"
            type="password"
            fullWidth/>
        </form>
        <Button onClick={event => this.props.handleModeChange(event, "signup")}>Sign Up</Button>
      </DialogContent>
      <DialogActions>
        <Button onClick={this.props.handleClose} color="secondary">
          Cancel
        </Button>
        <Button onClick={this.props.handleSubmit} color="primary">
          Sign In
        </Button>
      </DialogActions>
    </>
  }
}