import React from "react"
import Drawable from './Drawable'
import { Line } from "react-konva"
import {v4} from "uuid"
import {getRGBAString} from "../utils/utils";

export default class DrawPencil extends Drawable {
    constructor(startx, starty, strokeColor, fillColor) {
      super(startx, starty, strokeColor, fillColor,'pencil');
      this.points = [startx, starty];
      this.id = v4();
      this.scaleX = 1;
      this.scaleY = 1;
      this.rotation = 0;
    }

    registerMovement(x, y) {
      this.points = [...this.points, x, y]
    }

    dragStart = event => {
      const {x, y} = event.target.getStage().getPointerPosition();
      this.dragStartX = x
      this.dragStartY = y
    }

    dragEnd = event => {
      const {x, y} = event.target.getStage().getPointerPosition();
      const dx = x - this.dragStartX
      const dy = y - this.dragStartY
      for (var i = 0; i < this.points.length; i++) {
        if ((i % 2) == 0) {
          this.points[i] += dx
        } else if (i % 2 == 1) {
          this.points[i] += dy
        }
      }
      console.log(this.points)
      console.log(event.target.id())
    }

    trans(scale) {
      this.scaleX = scale.scaleX
      this.scaleY = scale.scaleY
      this.points = scale.points
      this.rotation = scale.rotation
    }

    render(isDragging) {
      return <Line 
        key={this.id}
        id={this.id}
        points={this.points} 
        draggable
        onDragStart={this.dragStart}
        onDragEnd={this.dragEnd}
        fill={getRGBAString(this.fillColor)}
        stroke={getRGBAString(this.strokeColor)}
        scaleX={this.scaleX}
        scaleY={this.scaleY}
        rotation={this.rotation}
        type='pencil'
      />;
    }
}
