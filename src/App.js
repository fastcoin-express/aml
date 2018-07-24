import React, {Component} from 'react';
import {Switch, Route, BrowserRouter} from 'react-router-dom';
import {PersistGate} from 'redux-persist/es/integration/react';
import {Provider} from 'react-redux';
import CaptureId from './screens/CaptureId';
import BackId from './screens/BackId';
import Selfie from './screens/Selfie';
import Data from './screens/Data';
import Error from './screens/Error';
import {store, persistor} from './store';
import "./style/main.css";

class App extends Component {
    render() {
        return (
            <div className={'mainContent'}>
                <Provider store={store}>
                    <PersistGate loading={null} persistor={persistor}>
                        <BrowserRouter>
                            <Switch>
                                <Route path="/" exact component={CaptureId}/>
                                <Route path="/back" exact component={BackId}/>
                                <Route path="/selfie" exact component={Selfie}/>
                                <Route path="/data" exact component={Data}/>
                                <Route path="/error" exact component={Error}/>
                            </Switch>
                        </BrowserRouter>
                    </PersistGate>
                </Provider>
            </div>
        );
    }
}

export default App;
