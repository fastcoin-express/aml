import React, {Component} from 'react';
import "../style/main.css";
import {Redirect} from "react-router-dom";
import Header from './Header';
import moment from "moment";
import {connect} from "react-redux";


class Data extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            fields: {},
            error: false,
        }
    }

    componentWillMount() {
        console.log(this.props.resultData);
        if (this.props.resultData === 'error' || !this.props.resultData) {
           this.setState({error:true})
        }
    }

    render() {
        if (this.state.error) {
            return <Redirect to='/error'/>;
        }
        if (!this.state.loading) {
            var face = (<img alt='idscango' className={'profile'} src={this.props.resultData['Photo']}/>);
            var signature = (<img alt='idscango' className={'signiture'} src={this.props.resultData['Signature']}/>);
        }
        return (
            <div>
                <Header />
                {this.state.loading ?
                    <div className={'contentCenter'}>
                        <img alt='idscango' className={'loadingIcon'} src={require('../assets/images/loader@3x.png')}/>
                    </div>
                    :
                    <div className={'contentData'}>
                        <div className={'photos'}>
                            {face}
                            {signature}
                        </div>
                        <div className={'data'}>
                            <ul>
                                {this.props.resultData['Full Name'] &&
                                <li>
                                    <p className={'type'}>Name</p>
                                    <p className={'info'}>{this.props.resultData['Full Name']}</p>
                                </li>
                                }
                                {this.props.resultData.Authentication &&
                                <li>
                                    <p className={'type'}>Document Authentication</p>
                                    <p className={'info'}>{this.props.resultData.Authentication}</p>
                                </li>
                                }
                                {this.props.faceMatch !== '' &&
                                <li>
                                    <p className={'type'}>Facial Score</p>
                                    <p className={'info'}>{this.props.faceMatch}</p>
                                </li>
                                }
                                {this.props.resultData['Document Number'] &&
                                <li>
                                    <p className={'type'}>License No.</p>
                                    <p className={'info'}>{this.props.resultData['Document Number']}</p>
                                </li>
                                }
                                {(this.props.resultData['Birth Place'] && this.props.resultData['Issuing State Name']) &&
                                <li>
                                    <p className={'type'}>Address</p>
                                    <p className={'info'}>{this.props.resultData['Birth Place'] + ' ' + this.props.resultData['Issuing State Name']}</p>
                                </li>
                                }
                                {(this.props.resultData['Address']) &&
                                <li>
                                    <p className={'type'}>Address</p>
                                    <p className={'info'}>{this.props.resultData['Address']}</p>
                                </li>
                                }
                                {this.props.resultData['Issuing State Name'] &&
                                <li>
                                    <p className={'type'}>Country</p>
                                    <p className={'info'}>{this.props.resultData['Issuing State Code']}</p>
                                </li>
                                }
                                {this.props.resultData['Birth Date'] &&
                                <li>
                                    <p className={'type'}>Date of Birth</p>
                                    <p className={'info'}>
                                        {moment(parseInt(this.props.resultData['Birth Date'].match(/\d+/g)[0], 10)).format("DD-MM-YYYY")}
                                    </p>
                                </li>
                                }
                                {this.props.resultData['Expiration Date'] &&
                                <li>
                                    <p className={'type'}>Expiration Date</p>
                                    <p className={'info'}>
                                        {moment(parseInt(this.props.resultData['Expiration Date'].match(/\d+/g)[0], 10)).format("DD-MM-YYYY")}
                                    </p>
                                </li>
                                }
                                {this.props.resultData['Issue Date'] &&
                                <li>
                                    <p className={'type'}>Issue Date</p>
                                    <p className={'info'}>
                                        {moment(parseInt(this.props.resultData['Issue Date'].match(/\d+/g)[0], 10)).format("DD-MM-YYYY")}
                                    </p>
                                </li>
                                }
                            </ul>
                        </div>
                        <a className={'buttonBg databuttton'} href={'/'}>
                            <p className={'buttonBgText'}>Home</p>
                        </a>
                    </div>

                }
            </div>
        );
    }
}


const mapStateToProps = (state) => ({
    instanceID: state.instanceID,
    faceMatch: state.faceMatch,
    resultData: state.resultData
});
export default connect(mapStateToProps)(Data);