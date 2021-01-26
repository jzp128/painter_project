import React, { Component } from 'react'
import { Rect } from "react-konva"
import {v4} from "uuid"
import AddImage from "../Drawables/AddImage"

export default class BackGround extends Component{
    render() {
        const { backGroundId, backGroundSize, width, height, fileId} = this.props
        let bg
        if (backGroundId) {
            bg = 
            <React.Fragment>
                <AddImage 
                    imageId={backGroundId} 
                    isBackGround="true"
                    backGroundSizeHandler={backGroundSize}
                    fileId={fileId}
                />
            </React.Fragment>
            
        } else {
            bg = 
                <Rect
                    id={v4()}
                    x={0}
                    y={0}
                    width={width}
                    height={height}
                    stroke="grey"
                    fill="white"
                />
        }
        return(
            bg
        )
    }
}
