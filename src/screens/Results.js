import React, {Component, Fragment} from 'react';
import {Redirect} from "react-router-dom";
import Header from './Header';
import moment from "moment";
import {connect} from "react-redux";
import Processing from "./Processing";

class Results extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            fields: {},
            error: false,
        }
    }

    componentWillMount() {
        if (this.props.resultData === 'error') {
            this.props.dispatch({payload: 'front', type: 'ADD_REDIRECT'});
           this.setState({error:true})
        }
    }

    processDate(date) {
        date = date.replace("Date", "");
        date = date.replace(")", "");
        date = date.replace("(", "");
        date = date.split("/").join("");
        date = date.split("+")[0];
        return parseInt(date);
    }

    render() {
        if (this.state.error) {
            return <Redirect to='/error'/>;
        }
        return (
            <Fragment>
                <Header />
                {!this.props.resultData && <Processing/>}

                {this.props.resultData &&
                    <div className={'contentData'}>
                        <div className={'photos'}>
                            {this.props.resultData['Photo'].length > 0 && <img alt='idscango' className={'profile'} src={this.props.resultData['Photo']}/>}
                            {this.props.resultData['Signature'].length > 0 && <img alt='idscango' className={'signature'} src={this.props.resultData['Signature']}/>}
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
                                        <p className={'info'}>{`${this.props.resultData['Address Line 1']}
                                        ${this.props.resultData['Address City']}
                                        ${this.props.resultData['Address State']}
                                        ${this.props.resultData['Address Postal Code']}
                                        ${this.props.resultData['Issuing State Code']}`}</p>
                                    </li>
                                }
                                {this.props.resultData['Birth Date'] &&
                                    <li>
                                        <p className={'type'}>Date of Birth</p>
                                        <p className={'info'}>
                                            {moment(this.processDate(this.props.resultData['Birth Date'])).format("DD-MM-YYYY")}
                                        </p>
                                    </li>
                                }
                                {this.props.resultData['Expiration Date'] &&
                                    <li>
                                        <p className={'type'}>Expiration Date</p>
                                        <p className={'info'}>
                                            {moment(this.processDate(this.props.resultData['Expiration Date'])).format("DD-MM-YYYY")}
                                        </p>
                                    </li>
                                }
                                {this.props.resultData['Issue Date'] &&
                                    <li>
                                        <p className={'type'}>Issue Date</p>
                                        <p className={'info'}>
                                            {moment(this.processDate(this.props.resultData['Issue Date'])).format("DD-MM-YYYY")}
                                        </p>
                                    </li>
                                }
                            </ul>
                        </div>
                        <a className={'buttonBg databuttton'} href={process.env.REACT_APP_BASENAME}>
                            <p className={'buttonBgText'}>Home</p>
                        </a>
                    </div>
                }
            </Fragment>
        );
    }
}


const mapStateToProps = (state) => ({
    instanceID: state.appReducer.instanceID,
    faceMatch: state.appReducer.faceMatch,
    resultData: state.appReducer.resultData
});
export default connect(mapStateToProps)(Results);