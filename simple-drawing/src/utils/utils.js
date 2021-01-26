import DrawPencil from "../Drawables/Pencil";
import DrawArrow from "../Drawables/Arrow";
import DrawCircle from "../Drawables/Circle";
import DrawRect from "../Drawables/Rectangle";


export function parseDrawables(data) {
  const result = [];
  console.log(data)
  data.forEach(d => {
    console.log(d)
    let parsed = parseDrawer(d);
    result.push(parsed);
  });
  return result;
}

export function DrawType(x, y, strokeColor, fillColor, type) {
  const drawableClasses = {
    DrawPencil,
    DrawArrow,
    DrawCircle,
    DrawRect
  };
  return new drawableClasses[type](x, y, strokeColor, fillColor);
}

export function getRGBAString(color) {
  return `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`
}

function parseDrawer(d, scale) {
  if (!d || !d.type) return;
  let p = null;
  switch (d.type) {
    case 'pencil':
      p = new DrawPencil(d.startx, d.starty);
      p.points = d.points;
      p.strokeColor = d.strokeColor;
      p.fillColor = d.fillColor;
      p.scaleX = d.scaleX;
      p.scaleY = d.scaleY;
      p.rotation = d.rotation;
      break;
    case 'arrow':
      p = new DrawArrow(d.startx, d.starty);
      p.x = d.x;
      p.y = d.y;
      p.points = d.points;
      p.strokeColor = d.strokeColor;
      p.fillColor = d.fillColor;
      p.scaleX = d.scaleX;
      p.scaleY = d.scaleY;
      p.rotation = d.rotation;
      break;
    case 'circle':
      p = new DrawCircle(d.startx, d.starty);
      p.x = d.x;
      p.y = d.y;
      p.radius = d.radius;
      p.strokeColor = d.strokeColor;
      p.fillColor = d.fillColor;
      p.scaleX = d.scaleX;
      p.scaleY = d.scaleY;
      p.rotation = d.rotation;
      break;
    case 'rectangle':
      p = new DrawRect(d.startx, d.starty);
      p.x = d.x;
      p.y = d.y;
      p.width = d.width;
      p.height = d.height;
      p.strokeColor = d.strokeColor;
      p.fillColor = d.fillColor;
      p.scaleX = d.scaleX;
      p.scaleY = d.scaleY;
      p.rotation = d.rotation;
      break;
    default:
      p = null;
      break;
  }
  return p;
}

export function getUserName() {
  return document.cookie.replace(/(?:(?:^|.*;\s*)username\s*\=\s*([^;]*).*$)|^.*$/, "$1");
}
