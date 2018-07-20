import React, {Component} from 'react';
import {connect} from 'react-redux';
import "../style/main.css";
import Header from './Header';
import ApiService from "../services/api/api";
import Processing from "./Processing"
import {Redirect} from "react-router-dom";

class CaptureId extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loaded: false,
            processing: false,
            error: false,
            instanceID: ''
        };
        this.textInput = React.createRef();
        this.onRetry = this.onRetry.bind(this);
    }

    dataURLtoBlob(dataURL) {
        var binary = atob(dataURL.split(',')[1]);
        var array = [];
        for (var i = 0; i < binary.length; i++) {
            array.push(binary.charCodeAt(i));
        }
        return new Blob([new Uint8Array(array)], {type: 'image/jpg'});
    }

    componentDidMount() {
        if(this.props.redirect){
            this.textInput.current.click();
        }
    }

    onRetry() {
        this.setState({processing: false}, () => {
            this.textInput.current.click();
        });
    }

    updateInputValue(evt) {
        var self = this;
        var file = evt.target;
        var reader = new FileReader();
        reader.onload = (e) => {

            self.setState({processing: true});
            if (window.File && window.FileReader && window.FileList && window.Blob) {


                var img = document.createElement("img");
                img.src = e.target.result;
                img.onload = function () {

                    var canvas = document.createElement("canvas");
                    var ctx = canvas.getContext("2d");
                    ctx.drawImage(img, 0, 0);

                    var MAX_WIDTH = 3032;
                    var MAX_HEIGHT = 2008;
                    var width = img.width;
                    var height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    ctx = canvas.getContext("2d");
                    ctx.mozImageSmoothingEnabled = false;
                    ctx.webkitImageSmoothingEnabled = false;
                    ctx.msImageSmoothingEnabled = false;
                    ctx.imageSmoothingEnabled = false;
                    ctx.drawImage(img, 0, 0, width, height);

                    var dataurl = canvas.toDataURL(file.files[0].type, 90 * .01);

                    ApiService
                        .postBackImage(self.props.instanceID, self.dataURLtoBlob(dataurl))
                        .then(response => {
                            self.setState({loaded: true});
                            console.log('sent'); //redirect to processing
                        })
                        .catch(error => {
                            self.setState({error: true});
                            self.props.dispatch({text: 'back', type: 'ADD_REDIRECT'});
                            console.log('asd');
                        })

                };
            } else {
                alert('The File APIs are not fully supported in this browser.');
            }


        };
        reader.readAsDataURL(file.files[0]);
    }

    render() {

        if (this.state.error) {
            return <Redirect to='/error'/>;
        }

        return (
            <div>
                {(this.state.processing) ?
                    <Processing loaded={this.state.loaded} onRetry={this.onRetry} orientation={1}/>
                    :
                    <div>
                        <Header />
                        <div className={'content'}>

                            <p className={'title'}>Upload a clear picture of the back of your ID card.</p>

                            <img alt='idscango' className={'image'}
                                 src={require('../assets/images/IDback@2x.png')}/>

                            <input type="file" accept="image/*" capture="environment" id="camera"
                                   value={this.state.inputValue}//for selfie capture="user"
                                   className={'inputHidden'}
                                   onChange={this.updateInputValue.bind(this)}
                                   ref={this.textInput}/>
                            <label htmlFor="camera" className={'buttonBg'}>
                                <p className={'buttonBgText'}>Capture ID</p>
                            </label>

                        </div>
                    </div>
                }
            </div>


        );
    }
}

const mapStateToProps = (state) => ({
    instanceID: state.instanceID,
    redirect: state.redirect
});
export default connect(mapStateToProps)(CaptureId);