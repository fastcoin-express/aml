import React, {Component, Fragment} from 'react';
import ApiService from "../services/api/api";
import Header from './Header';
import {Redirect} from "react-router-dom";
import {connect} from "react-redux";

class ProcessImage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            imageB64: '',
            blurry: false,
            redirectTo: '/capture/selfie',
            cardImage: null,
            idType: 0
        }
    }

    getImageAndQualityMetrics() {
        let instanceID = this.props.instanceID;
        Promise.all([ApiService.getImage(instanceID, this.props.orientation), ApiService.getImageQualityMetric(instanceID, this.props.orientation)])
            .then(response => {
                let imageResponse = response[0],
                    imageQualityResponse = response[1];

                var arr = new Uint8Array(imageResponse);
                var raw = '';
                let subArray, chunk = 5000;
                for (let i = 0, j = arr.length; i < j; i += chunk) {
                    subArray = arr.subarray(i, i + chunk);
                    raw += String.fromCharCode.apply(null, subArray);
                }
                var base64FrontReformattedImage = btoa(raw);
                if (imageQualityResponse.SharpnessMetric > 50) {
                    this.setState({
                        blurry: false,
                        loading: false,
                        cardImage: `data:image/jpeg;base64,${base64FrontReformattedImage}`
                    });
                } else {
                    this.setState({
                        blurry: true,
                        loading: false,
                        cardImage: `data:image/jpeg;base64,${base64FrontReformattedImage}`
                    });
                }
            })
            .catch(error => {
                this.setState({error: true, loading: false});
            })
    }

    componentDidUpdate(prevProps, prevState) {
        let instanceID = this.props.instanceID;
        if (this.props.loaded !== prevProps.loaded) {
            if(this.props.orientation === 0){
                ApiService.getClassification(instanceID)
                    .then(result => {
                        console.log(result);
                        this.setState({
                            idType: result.Type.Size,
                            loading: false
                        }, () => {
                            if (result.Type.Size === 0) {
                                this.props.history.push('/error')
                            } else {
                                this.getImageAndQualityMetrics();
                            }
                        });
                    })
                    .catch(err => {
                        console.log(err);
                    });
            } else {
                this.getImageAndQualityMetrics();
            }
        }
    }

    proceedToNextStep() {
        /**
         * If ID is Driver License
         */
        if (this.state.idType !== 3) {
            if (this.props.orientation === 0) {
                this.props.history.push('/capture/back')
            } else {
                this.props.history.push('/capture/selfie')
            }
        } else {
            this.props.history.push('/capture/selfie')
        }
    }


    render() {
        if (this.state.error) {
            return <Redirect to='/error'/>;
        }

        return (
            <Fragment>
                <Header />
                {this.state.loading ?
                    <div className={'contentCenter'}>
                        <p className={'title'}>Analyzing...</p>
                        <div className={"loadingContainer"}>
                            <img alt='idscango'
                                 className={'image'}
                                 src={this.props.orientation ? require('../assets/images/card_back@2x.png') : require('../assets/images/IDfront@2x.png') }
                            />
                            <div className={"loading"}>
                                <img alt='idscango'
                                     className={'findingIcon'}
                                     src={require('../assets/images/finder@2x.png')}
                                />
                            </div>
                        </div>
                    </div>
                : (this.state.blurry ?
                    <div className={'content'}>
                        <div className={'titleWithError'}>
                            <img alt='idscango'
                                 className={'icon'}
                                 src={require('../assets/images/icon_attention@2x.png')}
                            />
                            <p className={'title'}> Image appears blurry.</p></div>
                        {!this.state.loading && this.state.cardImage && <img alt={'idscango'} src={this.state.cardImage} className={'image'}/>}
                        <a className={'buttonBg'} href={this.state.redirectTo}>
                            <p className={'buttonBgText'}>Continue with this image</p>
                        </a>
                        {!this.props.orientation &&<div className={'buttonBd'} onClick={this.props.onRetry.bind(this)}>
                            <p className={'buttonBdText'}>Retry</p>
                        </div>}
                    </div>
                    :
                    <div className={'content'}>
                        <p className={'title'}>Ensure all texts are visible.</p>
                        {!this.state.loading && this.state.cardImage && <img alt={'idscango'} src={this.state.cardImage} className={'image'}/>}
                        <a className={'buttonBg'} onClick={this.proceedToNextStep.bind(this)}>
                            <p className={'buttonBgText'}>Continue with this image</p>
                        </a>
                        {!this.props.orientation && <div className={'buttonBd'} onClick={this.props.onRetry.bind(this)}>
                            <p className={'buttonBdText'}>Retry</p>
                        </div>}
                    </div>
                    )

                }
            </Fragment>
        );
    }
}

const mapStateToProps = (state) => ({
    instanceID: state.appReducer.instanceID
});
export default connect(mapStateToProps)(ProcessImage);
