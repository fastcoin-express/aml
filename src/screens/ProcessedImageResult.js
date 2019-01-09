import React, {Component, Fragment} from 'react';
import Header from "./Header";
import {bindActionCreators} from "redux";
import {connect} from "react-redux";
import {decrementSidesLeft, incrementSidesLeft, setCardOrientation} from "./actions/idPropertiesActions";

class ProcessedImageResult extends Component {

    constructor(props) {
        super(props);
    }

    proceedToNextStep() {
        /**
         * If ID is Driver License
         */
        let processedData = this.props.location.state;
        if (processedData.classificationData && processedData.classificationData.PresentationChanged) {
            this.props.setCardOrientation(0);
        } else {
            this.props.setCardOrientation(1);
        }
        if (processedData.classificationData && processedData.classificationData.Type.Size !== 3 || this.props.idProperties.cardType === 2) {
            if (this.props.idProperties.sidesLeft === 1) {
                this.props.history.push('/capture/photo');
            } else {
                if (process.env.REACT_APP_FRM_ENABLED === 'true' && this.props.idProperties.cardType === 1) {
                    this.props.history.push('/capture/selfie')
                } else {
                    if (this.props.idProperties.cardType === 1) {
                        this.props.history.push('/results/default');
                    }

                    if (this.props.idProperties.cardType === 2) {
                        this.props.history.push('/results/medicard');
                    }
                }
            }
        } else {
            if (process.env.REACT_APP_FRM_ENABLED === 'true' && this.props.idProperties.cardType === 1) {
                this.props.history.push('/capture/selfie')
            } else {
                this.props.history.push('/results/default');
            }
        }
    }

    retryPhoto() {
        this.props.incrementSidesLeft();
        this.props.history.push('/capture/photo', {isRetry: true})
    }

    renderTitleText() {
        if (this.props.blurry) return "Image appears blurry. Please retry.";
        if (this.props.hasGlare) return "Image has glare. Please retry.";
        return "Ensure all texts are visible."
    }


    render() {
        let processedData = this.props.location.state;
        return (
            <Fragment>

                <Header />

                <div className='body column capture_photo'>

                    {processedData.blurry &&

                        <div className='column description_container'>
                            <img alt='idscango' className='icon' src={require('../assets/images/icon_attention@2x.png')} />
                            <p className={'description error'}>{this.renderTitleText()}</p>
                        </div>

                    }

                    <div className='row wrapper description_container'>
                        {!processedData.blurry && <p className={'description'}>{this.renderTitleText()}</p>}
                    </div>

                    <div className="capture_group">

                        <div className='row wrapper capture_container'>
                            {processedData.cardImage && <img alt={'idscango'} src={processedData.cardImage} className='capture'/>}
                        </div>

                        <div className="wrapper column capture_controls">

                            <a className={'btn'} onClick={() => this.proceedToNextStep()}>
                                <p className={'buttonBgText'}>Continue with this image</p>
                            </a>
                            {!processedData.orientation && <div className={'btn outline'} onClick={() => this.retryPhoto()}>
                                <p className={'buttonBdText'}>Retry</p>
                            </div>}

                        </div>

                    </div>

                </div>

            </Fragment>
        )
    }
}

function mapStateToProps(state) {
    return state;
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({decrementSidesLeft, incrementSidesLeft, setCardOrientation}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(ProcessedImageResult);