import React, {Component} from 'react'
import '../styles/SideBarStyles.css';
import DrawPencil from "../Drawables/Pencil";
import DrawArrow from "../Drawables/Arrow";
import DrawCircle from "../Drawables/Circle";
import DrawRect from "../Drawables/Rectangle";

export default class Undo extends Component {

  handleUndo = () => {
    const { actions, drawables, images } = this.props

    if (actions.length >= 1) {
        let data;
        console.log('undo actions', actions)
        let lastAct = actions[actions.length - 1]
        console.log(lastAct)
        switch(lastAct.action) {
            case "create drawable":
            case "move drawable":
                data = drawables
                break
            case "import image":
            case "move image":
                data = images
                break
            case "transformed":
                data = drawables
              break
            default:
                console.log("Nothing")
                break
        }

        if (lastAct.action === "create drawable" || lastAct.action === "import image") {
            this.removeUndo(data, lastAct, actions)
        } else if (lastAct.action === 'move image') {
            console.log('going to undo drag handler')
            actions.pop()
            this.props.undoDragHandler(lastAct, actions)
        } else if (lastAct.action === 'transformed') {
            this.undoTrans(data, lastAct, actions)
        }
    }
  }
  undoTrans(drawables, lastAct, actions) {
    let obj = lastAct.info;
    let scale
    let newDrawable
    console.log(obj)

    let index = drawables.findIndex((drawable) => {
      if (drawable.id === obj.id) {
        const old = obj.drawable
        if (drawable.type === 'rectangle' || drawable.type === 'circle') {
          scale = {
            id: obj.id,
            scaleX: old.scaleX,
            scaleY: old.scaleY,
            rotation: old.rotation,
            x: old.x,
            y: old.y,
          }
        } else {
          scale = {
            id: obj.id,
            scaleX: old.scaleX,
            scaleY: old.scaleY,
            rotation: old.rotation,
            points: old.points,
          }
        }
        switch(drawable.type){
            case 'rectangle':
                newDrawable = new DrawRect(
                  old.x,
                  old.y,
                  old.strokeColor,
                  old.fillColor,
                )
                newDrawable.trans(scale, old.width, old.height)
                break;
            case 'circle':
                newDrawable = new DrawCircle(
                  old.x,
                  old.y,
                  old.strokeColor,
                  old.fillColor,
                )
                newDrawable.trans(scale, old.radius)
                break;
            case 'arrow':
                newDrawable = new DrawArrow(
                  old.x,
                  old.y,
                  old.strokeColor,
                  old.fillColor,
                )
                newDrawable.trans(scale)
                break;
            case 'pencil':
                newDrawable = new DrawPencil(
                  old.x,
                  old.y,
                  old.strokeColor,
                  old.fillColor,
                )
                newDrawable.trans(scale)
                break;
            default:
                newDrawable = drawable
        }
        console.log(newDrawable)
        return true
      }
    })
    drawables.splice(index, 1, newDrawable)
    actions.pop()
    console.log(drawables)
    this.props.undoTransformHandler(drawables, actions)
  }

  removeUndo(datas, lastAct, actions) {
    let obj = lastAct.info;

    let index = datas.findIndex((data) => {
        if (data.info === obj) {
          return true
        } 
    })
    datas.splice(index, 1)
    actions.pop()
    this.props.undoCreateHandler(datas, lastAct.type, actions)
  }

  render() {
    return (
        <button onClick={this.handleUndo}>Undo</button>
    )
  }
}
