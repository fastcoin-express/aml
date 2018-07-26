import storage from "redux-persist/es/storage";
import thunk from 'redux-thunk';
import createHistory from 'history/createBrowserHistory';
import {persistCombineReducers, persistStore} from "redux-persist";
import { connectRouter, routerMiddleware } from 'connected-react-router'
import {createStore, applyMiddleware} from 'redux';
import rootReducer from './rootReducer'

const loggerMiddleWare = store => next => action => {
    console.log("[LOG] Action triggered", action);
    next(action);
};

const initialState = {
    appReducer: {
        instanceID: null,
        faceMatch: null,
        resultData: null
    }
};

export const history = createHistory();

const config = {
    key: 'idscango',
    storage,
    whitelist: 'appReducer'
};

const reducer = persistCombineReducers(config, rootReducer);

function configureStore() {
    let store = createStore(
        connectRouter(history)(reducer),
        initialState,
        applyMiddleware(thunk, loggerMiddleWare, routerMiddleware(history))
    );
    let persistor = persistStore(store);
    return {persistor, store};
}

export const {persistor, store} = configureStore();