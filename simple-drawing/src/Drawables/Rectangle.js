import React from "react"
import Drawable from './Drawable'
import {Rect} from "react-konva"
import {v4} from "uuid"
import {getRGBAString} from "../utils/utils";

export default class DrawRect extends Drawable {
  constructor(startx, starty, strokeColor, fillColor) {
    super(startx, starty, strokeColor, fillColor,'rectangle');
    this.id = v4();
    this.x = startx;
    this.y = starty;
    this.scaleX = 1;
    this.scaleY = 1;
    this.rotation = 0;
  }

  registerMovement(x, y) {
    this.x = x;
    this.y = y;
    this.width = this.startx - this.x;
    this.height = this.starty - this.y;
  }

  dragEnd = event => {
    console.log('dragging');
    this.x = event.target.x();
    this.y = event.target.y();
  };

  trans(scale, width, height) {
    this.x = scale.x;
    this.y = scale.y;
    this.scaleX = scale.scaleX;
    this.scaleY = scale.scaleY;
    this.rotation = scale.rotation;
    this.width = width;
    this.height = height;
  }

  render(isDrawing) {
    return (
      <Rect
        key={this.id}
        id={this.id}
        width={this.width}
        height={this.height}
        rotation={this.rotation}
        scaleX={this.scaleX}
        scaleY={this.scaleY}
        x={this.x}
        y={this.y}
        draggable={!isDrawing}
        onDragEnd={this.dragEnd}
        fill={getRGBAString(this.fillColor)}
        stroke={getRGBAString(this.strokeColor)}
        type="rectangle"/>
    );
  }
}
