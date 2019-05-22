import React, { Component, Fragment } from 'react';
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import Header from "./Header";
import { decrementSidesLeft, setCardOrientation, setCardType } from "./actions/idPropertiesActions";
import { setInstanceID, submitBackID, submitFrontID } from "./actions/configActions";
import ApiService from "../services/api/api";
import Processing from "./Processing";

class CapturePhoto extends Component {

    constructor(props) {
        super(props);
        this.state = {
            inputValue: null,
            processing: false
        }
        this.textInput = React.createRef();
    }

    getImageAndQualityMetrics(classificationData) {
        Promise.all([ApiService.getImage(this.props.instanceID, this.props.orientation), ApiService.getImageQualityMetric(this.props.instanceID, this.props.orientation)])
            .then(response => {
                let imageResponse = response[0],
                    imageQualityResponse = response[1],
                    blurry = false,
                    hasGlare = false,
                    self = this;

                if (imageQualityResponse.HorizontalResolution < 300 || imageQualityResponse.VerticalResolution < 300) {
                    if (imageQualityResponse.Side === 0) {
                        self.props.submitFrontID();
                    }
                    if (imageQualityResponse.Side === 1) {
                        self.props.submitBackID();
                    }
                    this.props.history.push({pathname: '/error/lowresolution', state: {retryLastStep: true}});
                    return;
                }

                var arr = new Uint8Array(imageResponse);
                var raw = '';
                let subArray, chunk = 5000;
                for (let i = 0, j = arr.length; i < j; i += chunk) {
                    subArray = arr.subarray(i, i + chunk);
                    raw += String.fromCharCode.apply(null, subArray);
                }
                var base64FrontReformattedImage = btoa(raw);

                let image = new Image();
                image.src = `data:image/jpeg;base64,${base64FrontReformattedImage}`;
                new Promise((resolve, reject) => {
                    image.onload = function() {

                        var width, height;

                        if(image.height > image.width) {
                            width = image.height;
                            height = image.width;
                        }
                        else {
                            width = image.width;
                            height = image.height;
                        }

                        let aspectRatio = width / height;
                        if (aspectRatio < 1.4 || aspectRatio > 1.66) {
                            if (imageQualityResponse.Side === 0) {
                                self.props.submitFrontID();
                            }
                            if (imageQualityResponse.Side === 1) {
                                self.props.submitBackID();
                            }
                            return self.props.history.push({pathname: '/error/default', state: {retryLastStep: true}});
                        } else {
                            if (imageQualityResponse.Side === 0) {
                                self.props.submitFrontID();
                            }
                            if (imageQualityResponse.Side === 1) {
                                self.props.submitBackID();
                            }
                            resolve();
                        }
                    }
                }).then(() => {
                    if (imageQualityResponse.SharpnessMetric < 50 && process.env.REACT_APP_SHARPNESS_METRIC_ENABLED === 'true') {
                        blurry = true;
                    }
                    if (imageQualityResponse.GlareMetric < 50 && process.env.REACT_APP_GLARE_METRIC_ENABLED === 'true') {
                        hasGlare = true;
                    }

                    this.props.decrementSidesLeft();
                    this.props.history.push('/photo/confirm', {
                        blurry,
                        hasGlare,
                        classificationData,
                        cardImage: `data:image/jpeg;base64,${base64FrontReformattedImage}`
                    })
                });

            })
            .catch(error => {
                this.props.history.push('/error/default');
            })
    }

    getClassification() {
        ApiService.getClassification(this.props.instanceID)
            .then(result => {
                if (result.Type && result.Type.ClassName === 'Unknown') {
                    this.props.history.push('/error/default');
                } else {
                    if (result.PresentationChanged && this.props.sidesLeft === 2) {
                        this.props.setCardOrientation(1);
                        this.getImageAndQualityMetrics(result);
                    } else {
                        this.getImageAndQualityMetrics(result);
                    }
                }

            })
            .catch(err => {
                this.props.history.push('/error/default');
                throw new Error(err);
            });
    }

    dataURLToBlob(canvasDataURL) {
        let binary = atob(canvasDataURL.split(',')[1]);
        let array = [];
        for (let i = 0; i < binary.length; i++) {
            array.push(binary.charCodeAt(i));
        }
        return new Blob([new Uint8Array(array)], { type: 'image/jpg' });
    }

    sendImageToAPI(blobData) {
        if ((this.props.frontSubmitted && this.props.sidesLeft === 2) || (this.props.backSubmitted && this.props.sidesLeft === 2) || (this.props.backSubmitted && this.props.frontSubmitted && this.props.sidesLeft === 1)) {
            ApiService.replaceImage(this.props.instanceID, this.props.orientation, blobData)
                .then(response => {
                    if (this.props.cardType === 1) {
                        this.getClassification();
                    } else {
                        this.getImageAndQualityMetrics(null);
                    }
                })
                .catch(err => {
                    this.props.history.push({pathname: '/error/default', state: {retryLastStep: true}});
                    throw new Error(err);
                })
        } else {
            ApiService.postImage(this.props.instanceID, this.props.orientation, blobData)
                .then(response => {
                    if (this.props.cardType === 1) {
                        this.getClassification();
                    } else {
                        this.getImageAndQualityMetrics(null);
                    }
                })
                .catch(err => {
                    this.props.history.push({pathname: '/error/default', state: {retryLastStep: true}});
                    throw new Error(err);
                })
        }

    }

    isIEorEDGE() {
        return navigator.appName === 'Microsoft Internet Explorer' || (navigator.appName === "Netscape" && navigator.appVersion.indexOf('Edge') > -1);
    }

    processImage(event) {
        let file = event.target,
            reader = new FileReader();

        this.setState({
            processing: true
        });

        if (!file) {
            this.setState({
                processing: false
            });
            return;
        }
        window.scrollTo(0, 0)

        if (this.isIEorEDGE()) {
            this.sendImageToAPI(file.files[0]);
            return;
        }

        reader.onload = (e) => {
            if (window.File && window.FileReader && window.FileList && window.Blob) {
                let image = document.createElement('img');
                image.src = e.target.result;
                image.onload = () => {

                    let canvas = document.createElement('canvas'),
                        context = canvas.getContext('2d'),
                     //   MAX_WIDTH = 3032,
                      //  MAX_HEIGHT = 2008,
                        width = image.width,
                        height = image.height;

                    //   context.drawImage(image, 0, 0);

                   /* var largerDimension = width > height ? width : height;

                    if (largerDimension > MAX_WIDTH) {
                        if (width < height) {
                            var aspectRatio = height / width;
                            MAX_HEIGHT = MAX_WIDTH;
                            MAX_WIDTH = MAX_HEIGHT / aspectRatio;
                        }
                        else {
                            var aspectRatio = width / height;
                            MAX_HEIGHT = MAX_WIDTH / aspectRatio;
                        }
                    } else {
                        MAX_WIDTH = image.width;
                        MAX_HEIGHT = image.height;
                    } */

                  //  canvas.width = MAX_WIDTH;
                   // canvas.height = MAX_HEIGHT;

                    canvas.width = width;
                    canvas.height = height;

                    context = canvas.getContext('2d');
                    context.mozImageSmoothingEnabled = false;
                    context.webkitImageSmoothingEnabled = false;
                    context.msImageSmoothingEnabled = false;
                    context.imageSmoothingEnabled = false;

               //     context.drawImage(image, 0, 0, MAX_WIDTH, MAX_HEIGHT);
                     context.drawImage(image, 0, 0, width, height);

                    let canvasToDataURL = canvas.toDataURL(file.files[0].type, 90 * .01);
                    let blobData = this.dataURLToBlob(canvasToDataURL);

                    this.sendImageToAPI(blobData);
                }
            }
        };

        reader.readAsDataURL(file.files[0]);
    }

    componentDidMount() {
        if (!this.props.instanceID) {
            this.props.setInstanceID();
        }
        if (this.props.location && this.props.location.state) {
            if (this.props.location.state.isRetry) {
                this.textInput.current.click();
            }
        }

    }

    getOrientationCopy() {
        return this.props.orientation === 0 ? 'front' : 'back';
    }

    getCardTypeCopy() {
        switch (this.props.cardType) {
            case 1:
                return 'ID card';
            case 2:
                return 'medical card';
            default:
                return 'ID card';
        }
    }

    render() {
        if (this.state.processing) {
            return <Processing />
        }
        return (
            <Fragment>

                <Header />

                <div className='body column capture_photo'>

                    <div className='row wrapper description_container'>
                        <p className='description'>Upload a clear picture of the {this.getOrientationCopy()} of your {this.getCardTypeCopy()}.</p>
                    </div>

                    <div className="capture_group">

                        <div className='row wrapper capture_container'>


                            {this.props.sidesLeft === 2 &&
                            <img alt='idscango' className={'capture'} src={require('../assets/video/scan_process.gif')} />

                            }
                            {this.props.sidesLeft === 1 &&
                                <img alt='idscango' className={'capture'} src={this.props.frontSubmitted ? require('../assets/images/card_back@3x.png') : require('../assets/images/illustration1@3x.png')} />
                            }

                            <input type="file" accept="image/*" capture="environment" id="camera"
                                   name={'camera'}
                                value={this.state.inputValue}
                                className='hidden'
                                onChange={this.processImage.bind(this)}
                                ref={this.textInput}
                            />

                        </div>

                        <div className="wrapper column capture_controls">

                            {this.props.sidesLeft === 2 &&
                                <Fragment>
                                    {process.env.REACT_APP_IDPASSPORT_ENABLED === 'true' &&
                                        <label htmlFor="camera" className='btn' onClick={() => this.props.setCardType(1)}>
                                            <p className={'buttonBgText'}>Capture ID/Passport</p>
                                        </label>
                                    }
                                    {process.env.REACT_APP_MEDICAL_CARD_ENABLED === 'true' &&
                                        <label htmlFor="camera" className='btn' onClick={() => this.props.setCardType(2)}>
                                            <p className={'buttonBgText'}>Capture Medical Card</p>
                                        </label>
                                    }
                                </Fragment>
                            }

                            {this.props.sidesLeft === 1 &&
                                <label htmlFor="camera" className={'btn'}>
                                    <p className='buttonBgText'>Capture {this.getOrientationCopy()} of {this.getCardTypeCopy()}</p>
                                </label>
                            }
                            {this.props.sidesLeft === 1 && this.props.cardType === 2 &&
                                <div className={'btn outline'} onClick={() => { this.props.history.push('/results/medicard') }}>
                                    <p className={'buttonBdText'}>Skip this step</p>
                                </div>
                            }

                        </div>

                    </div>

                </div>

            </Fragment>
        );
    }
}

function mapStateToProps(state) {
    return {
        instanceID: state.config.instanceID,
        orientation: state.idProperties.orientation,
        cardType: state.idProperties.cardType,
        sidesLeft: state.idProperties.sidesLeft,
        frontSubmitted: state.config.frontSubmitted,
        backSubmitted: state.config.backSubmitted
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({ setCardType, setInstanceID, setCardOrientation, decrementSidesLeft, submitFrontID, submitBackID }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(CapturePhoto);