import React, {Component} from 'react';
import "../style/main.css";
import ApiService from "../services/api/api";
import Header from './Header';
import {Redirect} from "react-router-dom";
import {connect} from "react-redux";

class Processing extends Component {
    constructor(props) {
        super(props);
        this.theImage = React.createRef();
        this.state = {
            loading: true,
            imageB64: '',
            blurry: false,
        }
    }

    componentDidUpdate() {
        var instanceID = this.props.instanceID;
        console.log(this.props.loaded);
        if (this.props.loaded && this.state.loading) {
            ApiService
                .getFrontImage(instanceID)
                .then(res => {
                    console.log('avem imaginea');
                    //'data:image/png;base64, ' + btoa(unescape(encodeURIComponent(res)));

                    ApiService.getImageQualityMetric(instanceID)
                        .then(response => {
                            var arr = new Uint8Array(res);
                            var raw = '';
                            var i, j, subArray, chunk = 5000;
                            for (i = 0, j = arr.length; i < j; i += chunk) {
                                subArray = arr.subarray(i, i + chunk);
                                raw += String.fromCharCode.apply(null, subArray);
                            }
                            var base64FrontReformattedImage = btoa(raw);
                            console.log(response.SharpnessMetric);
                            if (response.SharpnessMetric > 50) {

                                this.setState({
                                    blurry: false,
                                    loading: false,
                                    imageSrc: `data:image/jpeg;base64,${base64FrontReformattedImage}`
                                });

                            } else {//we don't really know when the image is blurry...
                                this.setState({
                                    blurry: true,
                                    loading: false,
                                    imageSrc: `data:image/jpeg;base64,${base64FrontReformattedImage}`
                                });
                            }
                        })
                        .catch(error => {
                            this.setState({error: true, loading: false});
                        })
                })
                .catch(err => {
                    this.setState({error: true, loading: false});
                })
        }
    }


    render() {
        if (this.state.error) {
            return <Redirect to='/error'/>;
        }
        if (!this.state.loading) {
            var card = (<img alt={'idscango'} src={this.state.imageSrc} className={'image'}/>);
        }
        return (
            <div>
                <Header />


                {this.state.loading ?
                    <div className={'contentCenter'}>
                        <p className={'title'}>Analyzing...</p>
                        <div className={"loadingContainer"}>
                            <img alt='idscango'
                                 className={'image'}
                                 src={require('../assets/images/images_id_blurry@2x.png')}
                            />
                            <div className={"loading"}>
                                <img alt='idscango'
                                     className={'loadingIcon'}
                                     src={require('../assets/images/loader@3x.png')}
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
                                {card}
                                <a className={'buttonBg'} href={'/selfie'}>
                                    <p className={'buttonBgText'}>Continue with this image</p>
                                </a>
                                <div className={'buttonBd'} onClick={this.props.onRetry.bind(this)}>
                                    <p className={'buttonBdText'}>Retry</p>
                                </div>
                            </div>
                            :
                            <div className={'content'}>
                                <p className={'title'}>Ensure all texts are visible.</p>
                                {card}
                                <a className={'buttonBg'} href={'/selfie'}>
                                    <p className={'buttonBgText'}>Continue with this image</p>
                                </a>
                                <div className={'buttonBd'} onClick={this.props.onRetry.bind(this)}>
                                    <p className={'buttonBdText'}>Retry</p>
                                </div>
                            </div>

                    )

                }
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    instanceID: state.instanceID
});
export default connect(mapStateToProps)(Processing);
