import React, {Component} from 'react';
import {Switch, Route, Redirect} from 'react-router-dom';
import { ConnectedRouter } from 'connected-react-router'
import {PersistGate} from 'redux-persist/es/integration/react';
import {Provider} from 'react-redux';
import CaptureFrontID from './screens/CaptureFrontID';
import CaptureBackID from './screens/CaptureBackID';
import CaptureSelfie from './screens/CaptureSelfie';
import Results from './screens/Results';
import Error from './screens/Error';
import "./style/main.css";

class App extends Component {
    render() {
        return (
            <div className={'mainContent'}>
                <Provider store={this.props.store}>
                    <PersistGate loading={null} persistor={this.props.persistor}>
                        <ConnectedRouter history={this.props.routerHistory}>
                            <Switch>
                                <Redirect exact from="/" to="/capture/front"/>
                                <Route path="/capture/front" exact component={CaptureFrontID}/>
                                <Route path="/capture/back" exact component={CaptureBackID}/>
                                <Route path="/capture/selfie" exact component={CaptureSelfie}/>
                                <Route path="/results" exact component={Results}/>
                                <Route path="/error" exact component={Error}/>
                            </Switch>
                        </ConnectedRouter>
                    </PersistGate>
                </Provider>
            </div>
        );
    }
}

export default App;
