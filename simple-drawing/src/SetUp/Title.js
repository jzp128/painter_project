import React, { Component } from 'react'
import '../styles/BoardStyles.css'

export default class Title extends Component{

    render() {
        return(
            <React.Fragment>
                <div className="Title">
                    <label>Title: </label>
                    <input
                        className="Title"
                        type="text"
                        value={this.props.title}
                        onChange={this.props.handler}
                    />
                </div>
            </React.Fragment>
        )
    }
}