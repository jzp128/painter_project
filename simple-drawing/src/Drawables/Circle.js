import React from "react";
import {Circle} from "react-konva";
import Drawable from "./Drawable";
import {v4} from "uuid"
import {getRGBAString} from "../utils/utils";

export default class DrawCircle extends Drawable {
  constructor(startx, starty, strokeColor, fillColor) {
    super(startx, starty, strokeColor, fillColor,'circle');
    this.x = startx;
    this.y = starty;
    this.radius = 0;
    this.id = v4();
    this.scaleX = 1;
    this.scaleY = 1;
    this.rotation = 0;
  }

  registerMovement(x, y) {
    this.x = x;
    this.y = y;
    const dx = this.startx - this.x;
    const dy = this.starty - this.y;
    this.radius = Math.sqrt(dx * dx + dy * dy);
  }

  dragEnd = event => {
    this.x = event.target.x()
    this.y = event.target.y()
  }

  trans(scale, radius) {
    this.x = scale.x
    this.y = scale.y
    this.scaleX = scale.scaleX
    this.scaleY = scale.scaleY
    this.rotation = scale.rotation
    this.radius = radius
  }

  render(isDrawing) {
    return (
      <Circle 
        key={this.id}
        id={this.id}
        radius={this.radius} 
        x={this.x}
        y={this.y}
        draggable={!isDrawing}
        onDragEnd={this.dragEnd}
        fill={getRGBAString(this.fillColor)}
        stroke={getRGBAString(this.strokeColor)}
        scaleX={this.scaleX}
        scaleY={this.scaleY}
        rotation={this.rotation}
        type='circle'/>
        
    );
  }
}