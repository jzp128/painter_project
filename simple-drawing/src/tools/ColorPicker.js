import React from 'react'
import reactCSS from 'reactcss'
import {ChromePicker} from 'react-color'
import {Checkboard} from 'react-color/lib/components/common'

export default class ColorPicker extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      displayColorPicker: false,
      fillColor: this.props.fillColor,
      strokeColor: this.props.strokeColor,
      mode: 0
    };
  }

  handleStrokeClick = (event) => {
    event.stopPropagation();
    this.setState({displayColorPicker: !this.state.displayColorPicker, mode: 1});
  };

  handleFillClick = (event) => {
    event.stopPropagation();
    this.setState({displayColorPicker: !this.state.displayColorPicker, mode: 2});
  };

  handleClose = () => {
    this.setState({displayColorPicker: false, mode: 0})
  };

  handleFillColorChange(color) {
    this.setState({fillColor: color.rgb});
    this.props.fillColorHandler(color.rgb);
  }

  handleStrokeColorChange(color) {
    if (this.state.mode ===1) {
      this.setState({strokeColor: color.rgb});
      this.props.strokeColorHandler(color.rgb);
    } else if (this.state.mode === 2) {
      this.setState({fillColor: color.rgb});
      this.props.fillColorHandler(color.rgb);
    }
  }

  colorSelected() {
    if (this.state.mode === 1) {
      return this.state.strokeColor;
    } else if (this.state.mode === 2) {
      return this.state.fillColor;
    }
  }

  render() {
    const styles = reactCSS({
      'default': {
        strokeColor: {
          width: '55px',
          height: '55px',
          background: `rgba(${this.state.strokeColor.r}, ${this.state.strokeColor.g}, ${this.state.strokeColor.b}, ${this.state.strokeColor.a})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid grey',
          borderRadius: '2px'
        },

        fillColor: {
          width: '30px',
          height: '30px',
          background: `rgba(${this.state.fillColor.r}, ${this.state.fillColor.g}, ${this.state.fillColor.b}, ${this.state.fillColor.a})`,
          display: 'flex',
          cursor: 'pointer',
          border: '1px solid grey',
          borderRadius: '2px',
          position: 'relative'
        },
        fillBackground: {
          background: '#fff',
          borderRadius: '2px',

        },
        swatch: {
          padding: '5px',
          background: '#fff',
          borderRadius: '1px',
          boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
          display: 'inline-block',
          cursor: 'pointer',
        },

        popover: {
          position: 'absolute',
          zIndex: '2',
        },
        cover: {
          position: 'fixed',
          top: '0px',
          right: '0px',
          bottom: '0px',
          left: '0px',
        },
      },
    });

    return (
      <div>
        <div id='StrokeColorSelection' style={styles.strokeColor} onClick={this.handleStrokeClick}>
          <div style={styles.fillBackground}>
            <div style={styles.fillColor} onClick={this.handleFillClick}>
              {this.state.fillColor.a === 0 ?
                <Checkboard size={4} white="#fff" grey="#333"/> :
                null
              }
            </div>
          </div>

        </div>

        {this.state.displayColorPicker ? <div style={styles.popover}>
          <div style={styles.cover} onClick={this.handleClose}/>
          <ChromePicker color={this.colorSelected()} onChange={(color) => this.handleStrokeColorChange(color)}/>
        </div> : null}

      </div>
    )
  }
}