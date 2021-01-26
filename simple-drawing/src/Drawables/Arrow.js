import React from "react";
import Drawable from './Drawable'
import {Arrow} from "react-konva";
import {v4} from "uuid"
import {getRGBAString} from "../utils/utils";

export default class DrawArrow extends Drawable {
  constructor(startx, starty, strokeColor, fillColor) {
    super(startx, starty, strokeColor, fillColor, 'arrow');
    this.x = startx;
    this.y = starty;
    this.points = [];
    this.id = v4();
    this.scaleX = 1;
    this.scaleY = 1;
  };

  registerMovement(x, y) {
    this.x = x;
    this.y = y;
    this.points = [this.startx, this.starty, this.x, this.y];
  };

  dragStart = event => {
    const {x, y} = event.target.getStage().getPointerPosition();
    this.dragStartX = x;
    this.dragStartY = y;
  };

  dragEnd = (event) => {
    const {x, y} = event.target.getStage().getPointerPosition();
    const dx = x - this.dragStartX;
    const dy = y - this.dragStartY;
    for (let i = 0; i < this.points.length; i++) {
      if ((i % 2) === 0) {
        this.points[i] += dx;
      } else if (i % 2 === 1) {
        this.points[i] += dy;
      }
    }
  };

  trans(scale) {
    this.scaleX = scale.scaleX;
    this.scaleY = scale.scaleY;
    this.points = scale.points;
    this.rotation = scale.rotation;
  };

  render(isDrawing) {
    return <Arrow
      key={this.id}
      id={this.id}
      points={this.points}
      fill={getRGBAString(this.fillColor)}
      draggable={!isDrawing}
      onDragStart={this.dragStart}
      onDragEnd={this.dragEnd}
      stroke={getRGBAString(this.strokeColor)}
      scaleX={this.scaleX}
      scaleY={this.scaleY}
      rotation={this.rotation}
      type='arrow'/>
  }
}

