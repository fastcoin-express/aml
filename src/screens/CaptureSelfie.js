import React, {Component, Fragment} from 'react';
import Header from './Header';
import {connect} from "react-redux";
import FaceMatchService from "../services/api/faceMatch";
import {bindActionCreators} from "redux";
import {processID} from "./actions";
import Processing from "./Processing";

class CaptureSelfie extends Component {

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            inputValue: '',
            selfie: null
        };
    }

    componentDidMount() {
        let {instanceID} = this.props;
        this.props.processID(instanceID);
    }

    processSelfieAndRedirect() {
        if (this.props.resultData !== null) {
            if (this.props.resultData.Photo.split(',')[1] !== undefined) {
                if (this.state.selfie !== null) {
                    FaceMatchService.processFaceMatch({
                        'Data': {
                            'ImageOne': this.props.resultData.Photo.split(',')[1],
                            'ImageTwo': this.state.selfie
                        },
                        'Settings': {
                            'SubscriptionId': process.env.REACT_APP_SUBSCRIPTION_ID
                        }
                    }).then(res => {
                        this.props.dispatch({payload: res.Score, type: 'ADD_FACE_MATCH'});
                        this.props.history.push('/results');
                    })
                    .catch(err => {
                        throw new Error(err);
                    });
                }
            } else {
                this.props.history.push('/results');
            }
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.resultData !== this.props.resultData) {
            this.processSelfieAndRedirect();
        }
    }

    updateInputValue(evt) {
        let self = this;
        let file = evt.target;
        let reader = new FileReader();
        reader.readAsDataURL(file.files[0]);
        reader.onload = (e) => {
            
            self.setState({loading: true});
            let img = document.createElement("img");
            img.src = e.target.result;
            img.onload = function () {

                let canvas = document.createElement("canvas");
                let ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0);

                let MAX_WIDTH = 480;
                let MAX_HEIGHT = 640;
                let width = img.width;
                let height = img.height;

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
                self.setState({
                    selfie
                }, () => {
                    self.forceUpdate();
                    self.processSelfieAndRedirect();
                })
            };

        };
    }

    render() {
        return (
            <Fragment>
                <Header />
                {this.state.loading && <Processing/>}
                {!this.state.loading &&
                    <div className={'content'}>
                        <p className={'title'}>Take a selfie image using the front camera of your device.</p>
                        <img alt='idscango' className={'image'} src={require('../assets/images/illustration2@3x.png')}/>
                        <input type="file"
                               accept="image/*"
                               capture="user"
                               id="camera"
                               className={'inputHidden'}
                               onChange={this.updateInputValue.bind(this)}
                        />
                        <label htmlFor="camera" className={'buttonBg'}>
                            <p className={'buttonBgText'}>Take selfie image</p>
                        </label>
                        <div className={'buttonBd'} onClick={() => {this.props.history.push('/results')}}>
                            <p className={'buttonBdText'}>Skip this step</p>
                        </div>
                    </div>
                }
            </Fragment>
        );
    }
}

function mapStateToProps(state) {
    return {
        instanceID: state.appReducer.instanceID,
        faceMatch: state.appReducer.faceMatch,
        resultData: state.appReducer.resultData
    }
}

function mapDispatchToProps(dispatch) {
    let actions = bindActionCreators({processID}, dispatch);
    return {...actions, dispatch};
}

export default connect(mapStateToProps, mapDispatchToProps)(CaptureSelfie);
