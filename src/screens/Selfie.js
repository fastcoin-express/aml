import React, {Component, Fragment} from 'react';
import {Redirect} from 'react-router-dom';
import Header from './Header';
import ApiService from "../services/api/api";
import {connect} from "react-redux";
import FaceMatchService from "../services/api/faceMatch";

class Selfie extends Component {

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            loaded: false,
            skipStep: false,
            done: false
        };
    }

    componentDidMount() {
        let instanceID = this.props.instanceID;

        /**
         * Get results based on instanceID
         */

        ApiService
            .getResults(instanceID)
            .then(res => {
                var documentObj = res;
                var base64FaceReformattedImage = null;
                var base64SignatureReformattedImage = null;

                if (documentObj.Fields.length > 0) {
                    /**
                     * Get face image from Acuant Service
                     * Get signature image from Acuant Service
                     */
                    Promise.all([ApiService.getFaceImage(instanceID), ApiService.getSignatureImage(instanceID)])
                        .then(result => {
                            let faceImageResult = result[0],
                                signatureImageResult = result[1];
                            /**
                             * Process data
                             * @type {Uint8Array}
                             */
                            let faceImageResultArray = new Uint8Array(faceImageResult);
                            let rawFaceImage = '';
                            let faceImageResultSubArray, chunk = 5000;
                            for (let i = 0, j = faceImageResultArray.length; i < j; i += chunk) {
                                faceImageResultSubArray = faceImageResultArray.subarray(i, i + chunk);
                                rawFaceImage += String.fromCharCode.apply(null, faceImageResultSubArray);
                            }

                            let signatureImageResultArray = new Uint8Array(signatureImageResult);
                            let rawSignatureImage = '';
                            let signatureImageResultSubArray;
                            for (let i = 0, j = signatureImageResultArray.length; i < j; i += chunk) {
                                signatureImageResultSubArray = signatureImageResultArray.subarray(i, i + chunk);
                                rawSignatureImage += String.fromCharCode.apply(null, signatureImageResultSubArray);
                            }

                            base64FaceReformattedImage = btoa(rawFaceImage);
                            base64SignatureReformattedImage = btoa(rawSignatureImage);

                            if (!base64FaceReformattedImage.length || !base64SignatureReformattedImage.length) {
                                throw new Error('Could not process images');
                            }

                            let obj = {};

                            /**
                             * Pass processed data to our data object
                             */

                            documentObj.Fields.map(field => {
                                if (field.Name === "Photo") {
                                    obj[field.Name] = `data:image/jpeg;base64,${base64FaceReformattedImage}`;
                                } else if (field.Name === "Signature") {
                                    obj[field.Name] = `data:image/jpeg;base64,${base64SignatureReformattedImage}`;
                                } else {
                                    obj[field.Name] = field.Value;
                                }
                            });

                            let type = res.Result || 2;
                            let idAuthentication = null;

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

                            this.props.dispatch({payload: obj, type: 'ADD_RESULT_DATA'});

                            this.setState({
                                faceImage: base64FaceReformattedImage,
                                loaded: true,
                            });

                        })
                        .catch(err => {
                            this.setState({loaded:true});
                            this.props.dispatch({payload: 'error', type: 'ADD_RESULT_DATA'});
                        });

                } else {
                    this.setState({loaded:true});
                    this.props.dispatch({payload: 'error', type: 'ADD_RESULT_DATA'});
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

                let dataurl = canvas.toDataURL(file.files[0].type, 90 * .01);
                let selfie = dataurl.split(",")[1];

                self.setState({loading: true});

                FaceMatchService.processFaceMatch({
                    'Data': {
                        'ImageOne': self.state.faceImage,
                        'ImageTwo': selfie
                    },
                    'Settings': {
                        'SubscriptionId': window.env.SUBSCRIPTION_ID
                    }
                }).then(res => {
                        self.props.dispatch({payload: res.data.Score, type: 'ADD_FACE_MATCH'});
                        self.setState({loaded: true, done:true});
                    })
                    .catch(err => {
                        console.log(err);
                        self.setState({loaded: true, done:true});
                    });

            };

        };
    }

    render() {
        if (this.state.loaded && (this.state.skipStep || this.state.done )) {
            return <Redirect to='/data'/>
        }
        return (
            <Fragment>
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
                        <div className={'buttonBd'} onClick={() => {this.setState({skipStep: true})}}>
                            <p className={'buttonBdText'}>Skip this step</p>
                        </div>
                    </div>
                }

            </Fragment>
        );
    }
}

const mapStateToProps = (state) => ({
    instanceID: state.appReducer.instanceID,
    faceMatch: state.appReducer.faceMatch,
});
export default connect(mapStateToProps)(Selfie);
