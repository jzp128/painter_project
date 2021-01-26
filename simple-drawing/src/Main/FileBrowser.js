import React, {Component} from "react";
import "./FileBrowser.css";
import {BrowserRouter as useHistory, withRouter} from "react-router-dom";
import {getUserName} from "../utils/utils";
import IconButton from "@material-ui/core/IconButton";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from '@material-ui/core/Typography';
import MenuIcon from '@material-ui/icons/Menu';
import ExitToApp from '@material-ui/icons/ExitToApp';
import AddIcon from '@material-ui/icons/Add';
import Fab from "@material-ui/core/Fab";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import Avatar from "@material-ui/core/Avatar";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import FolderIcon from '@material-ui/icons/Folder';
import DeleteIcon from '@material-ui/icons/Delete';
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import TextField from "@material-ui/core/TextField";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";


class FileBrowser extends Component {

  constructor(props) {
    super(props);
    this.state = {
      drawingList: [],
      showCreateNew: false
    }
  }

  // useStyles = makeStyles((theme) => ({
  //   menuButton: {
  //     marginRight: theme.spacing(2),
  //   },
  //   title: {
  //     flexGrow: 1,
  //     color: 'green'
  //   },
  //   fab: {
  //     position: 'absolute',
  //     bottom: theme.spacing(2),
  //     right: theme.spacing(2),
  //   },
  // }));

  componentDidMount() {
    console.log(process.env.NODE_ENV);
    const user = getUserName();
    if (user) {
      this.getDrawing();
    } else {
      const {history} = this.props;
      history.push('/');
    }
  }

  getDrawing() {
    fetch('/api/user/getDrawingList/', {method: 'GET'}).then(
      (response) => {
        if (response.status === 200) {
          console.log(response);
          return response.json();
        } else if (response.status === 401) {
          const {history} = this.props;
          return history.push('/');
        }
      }
    ).then(
      (res) => {
        this.setState({drawingList: res})
      }
    )
  }

  handleCreateNew = (e) => {
    e.preventDefault();
    this.setState({showCreateNew: true});
  };

  handleCreateNewSubmit = (e) => {
    e.preventDefault();
    const title = document.getElementById('TitleForm').value;
    const width = document.getElementById('widthInput').value;
    const height = document.getElementById('heightInput').value;

    const widthCheck = !isNaN(width) && width > 0;
    const heightCheck = !isNaN(height) && height > 0;

    if (widthCheck && heightCheck) {
      fetch('/api/drawing/newDrawing/', {
        method: 'POST', headers: {'content-Type': 'application/json'},
        body: JSON.stringify({canvasTitle: title, width: width, height: height})
      }).then(() => {
        this.getDrawing();
        this.handleCloseCreateNewModal(e)
      });
    }
  };

  handleCloseCreateNewModal = (e) => {
    this.setState({showCreateNew: false});
    document.getElementById("CreateNewForm").reset();
  };

  handleRowClick = (canvasId) => {
    const {history} = this.props;
    // REDIRECTS TO THE PAGE
    return function (e) {
      e.preventDefault();
      history.push('/canvas/' + canvasId);
    }
  };

  handleDelete = (evt, id) => {
    evt.preventDefault();
    fetch('/api/canvas/' + id, {method: 'DELETE'}).then(
      (result) => {
        if (result.status === 200) {
          this.getDrawing();
        }
      }
    )

  };

  handleSignOut = (e) => {
    e.preventDefault();
    const {history} = this.props;
    fetch('/signout/', {method: 'GET'}
    ).then((res) => history.push('/')
    );
  }

  render() {
    return <div className="main">
      <AppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            className="menuButton"
            color="inherit"
            aria-label="open drawer"
          >
            <MenuIcon/>
          </IconButton>
          <Typography variant="h6" className="title">
            My Drawings
          </Typography>
          <div>
            <IconButton
              edge="end"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={this.handleSignOut}
              color="inherit"
            >
              <ExitToApp></ExitToApp>
            </IconButton>
          </div>

        </Toolbar>
      </AppBar>
      <Dialog open={this.state.showCreateNew} onClose={this.handleCloseCreateNewModal}>
        <DialogTitle id="form-dialog-title">Create New</DialogTitle>
        <DialogContent>
          <form id="CreateNewForm" autoComplete='true'>
            <TextField
              autoFocus
              margin="dense"
              id="TitleForm"
              label="Drawing Title"
              type="text"
              fullWidth
              required='true'
            />
            <TextField margin="dense"
                       id="widthInput"
                       label="Width"
                       type="number"
                       min="1"
                       fullWidth
                       required='true'/>
            <TextField margin="dense"
                       id="heightInput"
                       label="height"
                       type="number"
                       min="1"
                       fullWidth required='true'/>

          </form>

        </DialogContent>
        <DialogActions>
          <Button onClick={this.handleCloseCreateNewModal} color="secondary">
            Cancel
          </Button>
          <Button onClick={this.handleCreateNewSubmit} color="primary">
            Create
          </Button>
        </DialogActions>
      </Dialog>
      <div>
        <List dense={false}>
          {this.state.drawingList.map((drawing) => {
              return <ListItem dense button onClick={this.handleRowClick(drawing._id)}>
                <ListItemAvatar>
                  <Avatar>
                    <FolderIcon/>
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={drawing.title}
                  // secondary={secondary ? 'Secondary text' : null}
                />
                <ListItemSecondaryAction>
                  <IconButton edge="end" aria-label="delete" onClick={e => this.handleDelete(e, drawing._id)}>
                    <DeleteIcon/>
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            }
          )}
        </List>
      </div>
      <Fab aria-label='create New' className="fab" color='primary' onClick={this.handleCreateNew}>
        <AddIcon/>
      </Fab>
    </div>
  }
}

export default withRouter(FileBrowser);