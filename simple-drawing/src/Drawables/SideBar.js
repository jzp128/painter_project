import React, {Component} from 'react'
import '../styles/SideBarStyles.css';
import ColorPicker from "../tools/ColorPicker";
import Undo from '../tools/Undo';

export default class SideBar extends Component {

  render() {
    const { actions, drawables, images } = this.props

    return (
      <div className="SideBar">
        <button className='toolButton' onClick={() => this.props.handler("Pointer")}>Pointer</button>
        <button className='toolButton' onClick={() => this.props.handler("DrawArrow")}>Arrow</button>
        <button className='toolButton' onClick={() => this.props.handler("DrawCircle")}>Circle</button>
        <button className='toolButton' onClick={() => this.props.handler("DrawPencil")}>Pencil</button>
        <button className='toolButton' onClick={() => this.props.handler("DrawRect")}>Rectangle</button>
        <ColorPicker 
          fillColorHandler={this.props.fillColorHandler}
          strokeColorHandler={this.props.strokeColorHandler}
          strokeColor={this.props.strokeColor}
          fillColor={this.props.fillColor}
        />
        <Undo 
          actions={actions}
          drawables={drawables}
          images={images}
          undoCreateHandler={this.props.undoCreateHandler}
          undoDragHandler={this.props.undoDragHandler}
          undoTransformHandler={this.props.undoTransformHandler}
        />

      </div>
    )
  }
}