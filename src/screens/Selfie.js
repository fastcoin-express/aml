import React, {Component} from 'react';
import "../style/main.css";
import {Redirect} from 'react-router-dom';
import axios from "axios";
import Header from './Header';
import ApiService from "../services/api/api";
import {connect} from "react-redux";

class Selfie extends Component {
    constructor(props) {
        super(props);
        this.state = {
            imageB64: '',
            loading: false,
            loaded: false,
            skipStep: false,
            done:false
        };
        this.skipStep = this.skipStep.bind(this);
    }

    componentDidMount() {
        let instanceID = this.props.instanceID;
        ApiService
            .getResults(instanceID)
            .then(res => {
                var documentObj = res;
                var base64FaceReformattedImage = 'asd';
                var base64SignatureReformattedImage = 'asd';

                if (documentObj.Fields.length > 0) {


                    Promise.all([
                        ApiService
                            .getFaceImage(instanceID)
                            .then(result => {
                                var arr = new Uint8Array(result);
                                var raw = '';
                                var i, j, subArray, chunk = 5000;
                                for (i = 0, j = arr.length; i < j; i += chunk) {
                                    subArray = arr.subarray(i, i + chunk);
                                    raw += String.fromCharCode.apply(null, subArray);
                                }

                                base64FaceReformattedImage = btoa(raw);
                            })
                            .catch(error => {
                                console.log(error);
                            }),
                        ApiService
                            .getSignatureImage(instanceID)
                            .then(result => {
                                var arr = new Uint8Array(result);
                                var raw = '';
                                var i, j, subArray, chunk = 5000;
                                for (i = 0, j = arr.length; i < j; i += chunk) {
                                    subArray = arr.subarray(i, i + chunk);
                                    raw += String.fromCharCode.apply(null, subArray);
                                }

                                base64SignatureReformattedImage = btoa(raw);
                            })
                            .catch(error => {
                                console.log(error);
                            })])
                        .then(success => {
                            let obj = {};

                            documentObj.Fields.map(field => {
                                if (field.Name === "Photo") {
                                    obj[field.Name] = `data:image/jpeg;base64,${base64FaceReformattedImage}`;
                                } else if (field.Name === "Signature") {
                                    obj[field.Name] = `data:image/jpeg;base64,${base64SignatureReformattedImage}`;
                                } else {
                                    obj[field.Name] = field.Value;
                                }
                            });
                            let type = 1;
                            let idAuthentication = '';
                            res.Alerts.map(alert => {
                                console.log(alert);
                                if (alert.Result !== 1) type = alert.Result;
                            });
                            switch (type) {
                                case 2 :
                                    idAuthentication = 'Failed';
                                    break;
                                case 3 :
                                    idAuthentication = 'Skipped';
                                    break;
                                case 4 :
                                    idAuthentication = 'Caution';
                                    break;
                                case 5 :
                                    idAuthentication = 'Attention';
                                    break;
                                default:
                                    idAuthentication = 'Passed';
                                    break;
                            }
                            obj['Authentication'] = idAuthentication;

                            this.props.dispatch({text: obj, type: 'ADD_RESULT_DATA'});
                            this.setState({
                                faceImage: base64FaceReformattedImage,
                                loaded: true,
                            });

                        })
                        .catch(err => {
                            console.log(err);
                            this.setState({loaded:true});
                            this.props.dispatch({text: 'error', type: 'ADD_RESULT_DATA'});
                        });

                } else {
                    this.setState({loaded:true});
                    this.props.dispatch({text: 'error', type: 'ADD_RESULT_DATA'});
                }
            })
            .catch(err => {
                console.log(err);
            });

    }

    updateInputValue(evt) {
        var self = this;
        var file = evt.target;
        var reader = new FileReader();
        reader.readAsDataURL(file.files[0]);
        reader.onload = (e) => {

            var img = document.createElement("img");
            img.src = e.target.result;
            img.onload = function () {

                var canvas = document.createElement("canvas");
                var ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0);

                var MAX_WIDTH = 480;
                var MAX_HEIGHT = 640;
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
                ctx.drawImage(img, 0, 0, width, height);

                var dataurl = canvas.toDataURL(file.files[0].type, 90 * .01);
                var selfie = dataurl.split(",")[1];
                self.setState({loading: true});

                axios({
                    method: 'post',
                    url: 'https://frm.acuant.net/api/v1/facematch',
                    data: {
                        'Data': {
                            'ImageOne': self.state.faceImage,
                            'ImageTwo': selfie
                        },
                        'Settings': {
                            'SubscriptionId': 'c0232aba-54ac-48ae-b670-c7e215dadb49'
                        }
                    },
                    headers: {
                        'Authorization': 'Basic YW5kcmVpQG9rYXBpc3R1ZGlvLmNvbTp6NmswdmhrYjRnMmJkMmFj',
                        'Accept': 'application/json;charset=utf-8',
                        'Content-Type': 'application/json;charset=utf-8',
                    }

                })
                    .then(res => {
                        console.log(res);
                        self.props.dispatch({text: res.data.Score, type: 'ADD_FACE_MATCH'});
                        self.setState({loaded: true, done:true});
                    })
                    .catch(err => {
                        console.log(err);
                        self.setState({loaded: true, done:true});
                    });

            };

        };
    }

    skipStep(){
        this.setState({
            skipStep:true
        })
    }

    render() {
        if (this.state.loaded && (this.state.skipStep || this.state.done )) {
            return <Redirect to='/data'/>
        }
        return (
            <div>
                <Header />

                {(this.state.loading || this.state.skipStep) ?
                    <div className={'contentCenter'}>
                        <p className={'title'}>Processing...</p>
                        <div className={"loadingContainer loadingHeight"}>
                            <div className={"loading"}>
                                <img alt='idscango' className={'loadingIcon'}
                                     src={require('../assets/images/loader@3x.png')}/>
                            </div>
                        </div>
                    </div>
                    :

                    <div className={'content'}>
                        <p className={'title'}>Take a selfie image using the front camera of your device.</p>
                        <img alt='idscango' className={'image'} src={require('../assets/images/illustration2@3x.png')}/>
                        <input type="file"
                               accept="image/*"
                               capture="user"
                               id="camera"
                               value={this.state.inputValue}
                               className={'inputHidden'}
                               onChange={this.updateInputValue.bind(this)}
                        />
                        <label htmlFor="camera" className={'buttonBg'}>
                            <p className={'buttonBgText'}>Take selfie image</p>
                        </label>
                        <div className={'buttonBd'} onClick={this.skipStep}>
                            <p className={'buttonBdText'}>Skip this step</p>
                        </div>
                    </div>
                }

            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    instanceID: state.instanceID,
    faceMatch: state.faceMatch,
});
export default connect(mapStateToProps)(Selfie);
