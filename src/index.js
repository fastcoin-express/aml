import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import {store, persistor, history} from './store';

ReactDOM.render(<App routerHistory={history} store={store} persistor={persistor}/>, document.getElementById('root'));
registerServiceWorker();
