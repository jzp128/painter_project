import React, { Component } from 'react'
import axios from 'axios';
import '../styles/TopBarStyles.css';
import {v4} from "uuid"
import StartNew from '../SetUp/StartNew';
import Button from "@material-ui/core/Button";

export default class TopBar extends Component{

    constructor(props) {
        super(props);
        this.state = {
            selectedFile: null,
            background: false,
            imageId: null,
            newId: v4(),
        };
    }

    fileUpload = React.createRef();

    filePath = () => {
         this.fileUpload.current.click();
    };

    componentDidUpadate() {
    }

    fileSelectedHandler = event => {
        let file = event.target.files[0]
        let imgId = v4()
        this.setState({
            selectedFile: file,
            imageId: imgId
        })

        this.fileUploadHandler(file, imgId)
    }

    fileUploadHandler = (selectedFile, imageId) => {

        const { isUploading, fileId } = this.props
        const { newId } = this.state

        isUploading(true)

        const formData = new FormData()

        if (this.state.background === true) {
            formData.append('fileId', newId)
        } else {
            formData.append('fileId', fileId)
        }
        formData.append('imageId', imageId)
        formData.append('picture', selectedFile, selectedFile.name)

        axios({
            method: 'post',
            url: '/api/images',
            data: formData
        })
        .then(res => {
            console.log(res)
        })
        .then(
            this.imageSetting
        )
    }

    imageSetting = () => {
        const { imageId, newId } = this.state

        if (this.state.background === true) {
            this.props.backGroundHandler(imageId, newId, true)
        } else {
            this.props.importImageHandler(imageId, newId, true)
        }
        this.props.isUploading(false)
    }

    loadBackGroundHandler = () => {
        this.setState({
            background: true,
        })
        this.filePath()
    }

    importImageHandler = () => {
        this.setState({
            background: false
        })
        this.filePath()
    }

    render() {
        return (
            <div className="TopBar">
                {/*<StartNew handleStartNew={this.props.startNewHandler} />*/}
                <button onClick={this.loadBackGroundHandler}>Load Image</button>
                <button onClick={this.importImageHandler}>Add Image</button>
                <input
                    style={{ display: "none" }}
                    type="file"
                    accept="image/*"
                    ref={this.fileUpload}
                    onChange={this.fileSelectedHandler}
                />
                <Button color="primary" variant="solid" onClick={this.props.handleLogout}>Log Out</Button>
            </div>
        )
    }
}
