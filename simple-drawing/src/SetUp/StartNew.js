import React, { Component } from 'react'
import '../styles/BoardStyles.css'
import Popup from "reactjs-popup"
import {v4} from "uuid"

export default class startNew extends Component{

    constructor(props) {
        super(props);
        // changed to 800x800 for now
        this.state = {
            newId: v4(),
            width: 800,
            height: 800,
            update: true
        }
    }
    handleOnChange = (event) => {
        this.setState({
            [event.target.name]: event.target.value
        })
    }

    render() {
        const { width, height, newId, update } = this.state
        return(
            <React.Fragment>
                <Popup modal trigger={<button>New</button>}>
                    {close => (
                        <div className='startNew'>
                            <div className='startNewInput'>
                                <label> Height: </label>
                                <input className='label'
                                    id="newHeight"
                                    name="height"
                                    type="number"
                                    placeholder="height"
                                    onChange={this.handleOnChange}
                                />
                                <label> Width: </label>
                                <input
                                    id="newWidth"
                                    name="width"
                                    type="number"
                                    placeholder="width"
                                    onChange={this.handleOnChange}
                                />
                            </div>
                            <div className='startNewButtons'>
                                <button
                                    onClick={() => {
                                        this.props.handleStartNew(newId, window.innerWidth, window.innerHeight, update)
                                        close();
                                    }}
                                >
                                    Default
                                </button>
                                <button 
                                    onClick={() => {
                                        this.props.handleStartNew(newId, Number(width), Number(height), update);
                                        close();
                                    }}
                                >
                                    Start New
                                </button>
                            </div>
                        </div>
                    )}
                </Popup>
            </React.Fragment>
        )
    }
}