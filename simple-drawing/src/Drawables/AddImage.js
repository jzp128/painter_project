import React, { Component } from 'react'
import { Image } from 'react-konva';
import SocketService from "../utils/SocketService";
export default class AddImage extends Component {
    state = {
      image: null,
      x: 0,
      y: 0,
      isDraggable: false
    }

    componentDidMount() {
      this.loadImage();
    }

    componentDidUpdate(oldProps) {
      if (oldProps.imageId !== this.props.imageId) {
        this.loadImage();
      }
    }

    componentWillUnmount() {
      this.image.removeEventListener('load', this.handleLoad);
    }

    loadImage() {
      const { fileId, imageId } = this.props
      this.image = new window.Image();
      let url = `http://localhost:5000/api/images/${fileId}/${imageId}/uploaded`
      this.image.src = url;
      this.image.setAttribute('crossOrigin', 'anonymous')
      this.image.addEventListener('load', this.handleLoad);
    }

    setting = () => {
      console.log("loading")
    }

    handleLoad = () => {
      this.setState({
        image: this.image
      })

      if (this.props.isBackGround) {
       this.props.backGroundSizeHandler(this.imageNode.width(), this.imageNode.height())
       this.setState({
         isDraggable: false
       })
      } else {
        this.setState({
          isDraggable: true
        })
      }
    }

    dragEnd = event => {
      const { imageId } = this.props

      let newX = event.target.x()
      let newY = event.target.y()
      this.setState({
        x: newX,
        y: newY,
      })

      if (this.props.isBackGround === false) {
        console.log(imageId, newX, newY)
        this.props.updateImagePosition(imageId, newX, newY, true)
      }

    }

    render() {
      const { x, y } = this.state
      const { imageId } = this.props
      let posX;
      let posY;
      if (this.props.x && this.props.y) {
        posX = this.props.x
        posY = this.props.y
      } else {
        posX = x
        posY = y
      }
      return (
        <Image 
          x={posX}
          y={posY}
          id={imageId}
          key={imageId}
          image={this.state.image}
          ref={node => {
            this.imageNode = node;
          }}
          draggable={this.state.isDraggable}
          onDragEnd={this.dragEnd}
          onLoad={this.setting}
        />
      )
    }
  }
  
