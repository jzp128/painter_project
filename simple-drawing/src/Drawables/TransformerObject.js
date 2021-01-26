import React, { Component } from "react";
import { Transformer } from "react-konva";

export default class TransformerObject extends Component {

    componentDidUpdate() {
      this.checkNode()
    }

    handleTransform = (event) => {
      const { selectedId, transHandler } = this.props;
      let scale;
      console.log(event.target.attrs.type);
      switch(event.target.attrs.type) {
        case 'pencil':
        case 'arrow':
          scale = {
            id: selectedId,
            scaleX: event.target.scaleX(),
            scaleY: event.target.scaleY(),
            rotation: event.target.rotation(),
            points: event.target.points(),
          };
          break;
        case 'circle':
        case 'rectangle':
          scale = {
            id: selectedId,
            scaleX: event.target.scaleX(),
            scaleY: event.target.scaleY(),
            rotation: event.target.rotation(),
            x: event.target.x(),
            y: event.target.y(),
          }
          break;
        default:
          scale = {
            id: selectedId,
          }
      }
      transHandler(scale, true);
    }

    checkNode() {
        const stage = this.transformer.getStage();
        const { selectedId } = this.props;
        const selectedNode = stage.findOne(`#${selectedId}`);
        if (selectedNode === this.transformer.node()) {
          return;
        }
        console.log('selectedNode', selectedNode)
        console.log('transformer', this.transformer)
        if (selectedNode) {
          this.transformer.attachTo(selectedNode);
        } else {
          this.transformer.detach();
        }
        this.transformer.getLayer().batchDraw();
      }

      render() {
        return (
          <Transformer
            ref={node => {
              this.transformer = node;
            }}
            onTransformEnd={this.handleTransform}
          />
        );
      }
    }
