import DrawPencil from "./Pencil";
import DrawArrow from "./Arrow";
import DrawCircle from "./Circle";
import DrawRect from "./Rectangle";

export default function Trans(drawables, scale) {
  let newDrawable, beforeTrans;

  let index = drawables.findIndex((drawable) => {
    if (drawable.id === scale.id) {

      switch (drawable.type) {
        case 'rectangle':
          newDrawable = new DrawRect(
            drawable.x,
            drawable.y,
            drawable.strokeColor,
            drawable.fillColor,
          );
          newDrawable.trans(scale, drawable.width, drawable.height);
          break;
        case 'circle':
          newDrawable = new DrawCircle(
            drawable.x,
            drawable.y,
            drawable.strokeColor,
            drawable.fillColor,
          );
          newDrawable.trans(scale, drawable.radius);
          break;
        case 'arrow':
          newDrawable = new DrawArrow(
            drawable.x,
            drawable.y,
            drawable.strokeColor,
            drawable.fillColor,
          );
          newDrawable.trans(scale);
          break;
        case 'pencil':
          newDrawable = new DrawPencil(
            drawable.x,
            drawable.y,
            drawable.strokeColor,
            drawable.fillColor,
          );
          newDrawable.trans(scale);
          break;
        default:
          newDrawable = drawable
      }
      beforeTrans = {id: newDrawable.id, drawable: drawable};
      return true
    }
  });

  drawables.splice(index, 1, newDrawable);
  let result = {before: beforeTrans, drawables: drawables};
  return result;
}