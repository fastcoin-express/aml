import React, {Component} from 'react';
import {Switch, Route, BrowserRouter} from 'react-router-dom';
import {PersistGate} from 'redux-persist/es/integration/react';
import {Provider} from 'react-redux';
import CaptureId from './screens/CaptureId';
import Processing from './screens/Processing';
import Selfie from './screens/Selfie';
import Data from './screens/Data';
import Error from './screens/Error';
import {store, persistor} from './store';

class App extends Component {
    render() {
        return (
            <div className={'mainContent'}>
                <Provider store={store}>
                    <PersistGate loading={<div>loading</div>} persistor={persistor}>
                        <BrowserRouter>
                            <Switch>
                                <Route props={this.props} path="/" exact component={CaptureId}/>
                                <Route props={this.props} path="/processing" exact component={Processing}/>
                                <Route props={this.props} path="/selfie" exact component={Selfie}/>
                                <Route props={this.props} path="/data" exact component={Data}/>
                                <Route props={this.props} path="/error" exact component={Error}/>
                            </Switch>
                        </BrowserRouter>
                    </PersistGate>
                </Provider>
            </div>
        );
    }
}

export default App;
