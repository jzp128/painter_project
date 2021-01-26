import React, {Component} from "react"
import {Layer, Stage} from "react-konva"
import {DrawType, parseDrawables} from "../utils/utils"
import SideBar from "../Drawables/SideBar"
import TopBar from "../Drawables/TopBar"
import '../styles/BoardStyles.css'
import BackGround from "../SetUp/BackGround"
import Title from "../SetUp/Title";
import AddImage from "../Drawables/AddImage"
import TransformerObject from "../Drawables/TransformerObject"
import {v4} from "uuid"
import Trans from "../Drawables/Trans"
import Button from "@material-ui/core/Button";
import { BrowserRouter as useLocation } from 'react-router-dom'

export default class DrawBoard extends Component {

  constructor(props) {
    super(props);
    this.state = {
      id: v4(),
      title: "",
      backGroundId: null,
      drawables: [],
      newDrawable: [],
      newType: "Pointer",
      width: null,
      height: null,
      prevSelected: "",
      selected: "",
      isDrawing: false,
      canvasId: null,
      canvasShared: false,
      upLoading: false,
      images: [],
      actions: [],
      strokeColor: {
        r: '0',
        g: '0',
        b: '0',
        a: '1'
      },
      fillColor: {
        r: '255',
        g: '255',
        b: '255',
        a: '1'
      },
      update: false,
    };

    this.handleSideBar = this.handleSideBar.bind(this);
  }

  async componentDidMount() {
    // gets the link if it exists
    if (this.props.match.params.id) {
      let {id} = this.props.match.params;
      await this.setState({canvasId: id});
    } else {
      const {history} = this.props;
      history.push('/myDrawings/');
    }

    fetch('/api/canvas/' + this.state.canvasId, {method: 'GET'}).then(
      res => {
        if (res.status === 200) {
          return res.json();
        } else {
          return null;
        }
      }
    ).then(
      (data) => {
        const {history} = this.props;
        if (!data) return history.push('/myDrawings/');
        const drawables = parseDrawables(data.drawables);
        this.setState({
          drawables: drawables,
          width: parseInt(data.width),
          height: parseInt(data.height),
          title: data.title,
          canvasShared: data.isShared
        });
      }
    );

    this.props.socketService.emit('join-room', {}, {roomId: this.state.canvasId});
    // subscribe to updated event
    this.props.socketService.listen('drawable-updated', this.drawableUpdateCallback);
    this.props.socketService.listen('background-updated', this.handleBackgroundUpdate);
    this.props.socketService.listen('startnew-updated', this.handleStartNewUpdate);
    this.props.socketService.listen('importImage-updated', this.handleImportImagesUpdate);
    this.props.socketService.listen('title-updated', this.handletitleUpdate);
    this.props.socketService.listen('image-updated', this.handleImageUpdate);
    this.props.socketService.listen('undo-updated', this.handleUndoUpdate);
  }

  drawableUpdateCallback = (data) => {
    let new_drawables = parseDrawables(data);
    this.setState({drawables: new_drawables});
  };

  handleMouseDown = event => {
    const {newDrawable} = this.state;
    if (this.state.isDrawing) {
      if (newDrawable.length === 0) {
        const {x, y} = event.target.getStage().getPointerPosition();
        const newDrawable = DrawType(
          x,
          y,
          this.state.strokeColor,
          this.state.fillColor,
          this.state.newType
        );
        this.setState({
          newDrawable: [newDrawable],
        });
      } else {
        const clickedOnEmpty = event.target === event.target.getStage();
        if (clickedOnEmpty) {
          this.setState({
            selected: ""
          })
        }
      }
    }
  };

  handleMouseUp = event => {
    const {newDrawable, drawables, actions} = this.state;
    if (newDrawable.length === 1) {
      const {x, y} = event.target.getStage().getPointerPosition();
      const drawableToAdd = newDrawable[0];
      drawableToAdd.registerMovement(x, y);
      drawables.push(drawableToAdd);

      let newAct = {action: "create drawable", info: drawableToAdd, type: "drawables"};
      this.setState({
        actions: [...actions, newAct],
        newDrawable: [],
        drawables
      });
      let data = {id: this.state.canvasId, newDrawable: drawables};
      this.props.socketService.emit('end-drawing', {}, data);
    }
  };

  handleMouseMove = event => {
    const {newDrawable} = this.state;
    if (newDrawable.length === 1) {
      const {x, y} = event.target.getStage().getPointerPosition();
      const updatedNewDrawable = newDrawable[0];
      updatedNewDrawable.registerMovement(x, y);
      this.setState({
        newDrawable: [updatedNewDrawable]
      });
    }
  };

  // handle everything inside the sidebar
  handleSideBar(type) {
    if (type !== "Pointer") {
      this.setState({
        isDrawing: true
      })
    } else {
      this.setState({
        isDrawing: false
      })
    }
    this.setState({
      newType: type
    })
  }

  handleFillColorChange = (color) => {
    this.setState({fillColor: color});
  };

  handleStrokeColorChange = (color) => {
    this.setState({strokeColor: color});
  };

  downloadURI = (uri, name) => {
    const link = document.createElement("a");
    link.download = name;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  handleDownload = () => {
    let image = this.stageRef.getStage().toDataURL({
      mimeType: "image/jpeg",
      quality: 1,
      pixelRatio: 2
    });
    this.downloadURI(image, this.state.title)
  };

  handleStageClick = (event) => {
    if (!this.state.isDrawing) {
      const {selected} = this.state;
      this.setState({
        prevSelected: selected,
        selected: event.target.id()
      });
    }
  };

  handleTrans = (scale, update) => {
    const {drawables, actions} = this.state;

    let transformed = Trans(drawables, scale);

    let newAct = {action: "transformed", info: transformed.before, type: "drawables"};

    this.setState({
      actions: [...actions, newAct],
      drawables: transformed.drawables
    });
    if (update === true) {
      let data = {id: this.state.canvasId, newDrawable: transformed.drawables, scale: scale};
      this.props.socketService.emit('end-drawing', {}, data);
    }
  };

  handleShareCanvas = () => {
    if (!this.state.canvasShared) {
      fetch('/api/canvas/sharedrawing',
        {
          method: 'POST',
          headers: {'Content-type': 'application/json'},
          body: JSON.stringify({id: this.state.canvasId})
        }
      )
        .then((res) => {
          return res.json()
        })
        .then((data) => {
          console.log('shared', data);
          this.setState({canvasShared: true, canvasId: data});
          const url = window.location.href;
          console.log(url);
          alert("copy this url and send to your friends!", );
        });
    }else{
      const url = window.location.href;
      console.log(url);
      alert("copy this url and send to your friends! " + url);
    }
  };

  // Change Title
  titleChangeHandler = (event) => {
    this.setState({
      title: event.target.value
    });

    this.props.socketService.emit('title-update', {}, {
      id: this.state.canvasId,
      title: event.target.value
    });
  };

  handletitleUpdate = (data) => {
    this.setState({
      title: data.title
    })
  };

  // Set the background imageId
  // similar to create a new file
  // mainly to clear everything inside the board
  backGroundHandler = (imageId, fileId, update) => {
    this.setState({
      id: fileId,
      title: "Image",
      backGroundId: imageId,
      drawables: [],
      newDrawable: [],
      newType: "Pointer",
      selected: "",
      isDrawing: false,
      upLoading: false,
      images: [],
    });

    if (update === true) {
      this.props.socketService.emit('background-update', {}, {
        id: fileId,
        backGroundId: imageId
      });
    }
  };

  handleBackgroundUpdate = (data) => {
    this.backGroundHandler(data.backGroundId, data.id, false)
  };

  // set new size of the stage
  backGroundSizeHandler = (width, height) => {
    this.setState({
      width: width,
      height: height
    })
  };

  setUploading = (isUploading) => {
    this.setState({
      upLoading: isUploading
    })
  };

  componentDidUpdate = () => {
    // console.log(update)

    // console.log("Update", this.state.backGroundId)
    // console.log("images", this.state.images)
  };

  // When listen update images
  handleImportImagesUpdate = (data) => {
    this.setState({
      images: [...this.state.images, data.image]
    })
  };

  handleImportImages = (imageId, id, update) => {
    // const { id, images } = this.state

    const imageInfo = {imageId: imageId, x: 0, y: 0};
    const image = {id: imageId, info: imageInfo};
    let newAct = {action: "import image", info: imageId, type: "images"};
    this.setState({
      images: [...this.state.images, image],
      actions: [...this.state.actions, newAct]
    });

    if (update === true) {
      this.props.socketService.emit('importImage-update', {}, {
        image: image
      });
    }
  };

  handleLogout = (evt) => {
    evt.preventDefault();
    const {history} = this.props;
    fetch('/signout/', {method: 'GET'}
    ).then((res) => history.push('/')
    );
  };

  handleImageUpdate = (data) => {

    const newImage = data.image;
    this.updateImagePosition(newImage.id, newImage.info.x, newImage.info.y, false)
  };

  updateImagePosition = (imageId, newX, newY, update) => {
    const {images} = this.state;
    let newImage = {};
    let oldImage = {};

    let index = images.findIndex((image) => {
      if (image.info.imageId === imageId) {

        const oldImageInfo = {imageId: image.info.imageId, x: image.info.x, y: image.info.y};
        const newImageInfo = {imageId: image.info.imageId, x: newX, y: newY};
        newImage = {id: imageId, info: newImageInfo};
        oldImage = {id: imageId, info: oldImageInfo};

        return true
      }
    });


    images.splice(index, 1, newImage);
    let newImages = images;
    // let newImages = images.splice(index, 1, newImage)

    let newAct = {action: "move image", info: oldImage, type: "images"};

    this.setState({
      images: newImages,
      actions: [...this.state.actions, newAct]
    });


    if (update === true) {
      this.props.socketService.emit('image-update', {}, {
        image: newImage
      });
    }
  };

  // When listen update start new
  handleStartNewUpdate = (data) => {
    this.handleStartNew(data.newId, data.newWidth, data.newHeight, false);
  };

  handleStartNew = (newId, width, height, update) => {
    this.setState({
      id: newId,
      title: "Image",
      backGroundId: null,
      drawables: [],
      newDrawable: [],
      newType: "Pointer",
      width: width,
      height: height,
      selected: "",
      isDrawing: false,
      upLoading: false,
      images: []
    });

    if (update === true) {
      this.props.socketService.emit('startnew-update', {}, {
        newId: newId,
        newWidth: width,
        newHeight: height,
      });
    }
  };

  handleCreateUndo = (data, type, actions) => {
    const {drawables, canvasId} = this.state;

    this.setState({
      [type]: data,
      actions: actions
    });
    if (type === "drawables") {
      let drawableData = {id: canvasId, newDrawable: drawables};
      this.props.socketService.emit('end-drawing', {}, drawableData);
    } else {
      this.props.socketService.emit('undo-update', {}, {
        type: type,
        data: data,
      });
    }

  };

  handleDragUndo = (lastAct, actions) => {
    // infomation stored in lastAct, since its image so we need the information that stored inside the image
    // the information of lastAct could be just image id or the drawable.
    const imageId = lastAct.info.info.imageId;
    const newX = lastAct.info.info.x;
    const newY = lastAct.info.info.y;
    this.updateImagePosition(imageId, newX, newY, true);
    this.setState({
      actions: actions
    })
  };

  handleTransformUndo = (data, actions) => {
    const {drawables, canvasId} = this.state;
    this.setState({
      drawables: data,
      actions: actions
    });

    let drawableData = {id: canvasId, newDrawable: drawables};
    this.props.socketService.emit('end-drawing', {}, drawableData);
  };

  handleUndoUpdate = (data) => {
    this.setState({
      [data.type]: data.data
    });

  };

  handleDrag = (event) => {
    event.evt.preventDefault();
    if (!this.state.isDrawing) {
      const {drawables, canvasId} = this.state;
      let drawableData = {id: canvasId, newDrawable: drawables};
      this.props.socketService.emit('end-drawing', {}, drawableData);
    }
  };

  render() {
    const drawables = [...this.state.drawables, ...this.state.newDrawable];
    const {backGroundId, title, width, height, id, images, strokeColor, fillColor, actions, selected, isDrawing} = this.state;
    return (
      <div className="Main">
        <div id='TopMenuBar' className="Top">
          <Title title={title} handler={this.titleChangeHandler}/>
          <button onClick={this.handleDownload}>Download</button>
          <button onClick={this.handleShareCanvas}>Get Link</button>
          <TopBar
            fileId={id}
            startNewHandler={this.handleStartNew}
            backGroundHandler={this.backGroundHandler}
            importImageHandler={this.handleImportImages}
            isUploading={this.setUploading}
            handleLogout={this.handleLogout}
          />

        </div>
        <div className="MainBoard">
          <SideBar
            handler={this.handleSideBar}
            fillColorHandler={this.handleFillColorChange}
            strokeColorHandler={this.handleStrokeColorChange}
            strokeColor={strokeColor}
            fillColor={fillColor}
            actions={actions}
            drawables={drawables}
            images={images}
            undoCreateHandler={this.handleCreateUndo}
            undoDragHandler={this.handleDragUndo}
            undoTransformHandler={this.handleTransformUndo}
          />

          <div className="CanvasContainer">
            <Stage
              className="Board"
              ref={node => {
                this.stageRef = node
              }}
              onMouseDown={this.handleMouseDown}
              onMouseUp={this.handleMouseUp}
              onMouseMove={this.handleMouseMove}
              width={width}
              height={height}
              onClick={this.handleStageClick}
              onDragEnd={this.handleDrag}
            >
              <Layer id="Background">
                <BackGround
                  backGroundSize={this.backGroundSizeHandler}
                  backGroundId={backGroundId}
                  width={width}
                  height={height}
                  fileId={id}
                />
              </Layer>
              <Layer>
                {images.map(image => (
                  <AddImage
                    key={image.info.imageId}
                    id={image.id}
                    imageId={image.info.imageId}
                    x={image.info.x}
                    y={image.info.y}
                    isBackGround={false}
                    fileId={id}
                    updateImagePosition={this.updateImagePosition}
                  />
                ))}
              </Layer>
              <Layer>
                {drawables.map(drawable => {
                  return drawable.render(isDrawing);
                })}
                <TransformerObject selectedId={selected} transHandler={this.handleTrans}/>
              </Layer>
            </Stage>
          </div>
        </div>
      </div>
    );
  }
}
