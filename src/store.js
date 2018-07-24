import storage from "redux-persist/es/storage";
import {persistCombineReducers, persistStore} from "redux-persist";
import {createStore} from 'redux';
import rootReducer from './rootReducer'

const initialState = {
    appReducer: {
        instanceID: null,
        faceMatch: null,
        resultData: null
    }
};

const config = {
    key: 'idscango',
    storage,
    whitelist: 'appReducer'
};

const reducer = persistCombineReducers(config, rootReducer);

function configureStore() {
    let store = createStore(
        reducer,
        initialState
    );
    let persistor = persistStore(store);
    return {persistor, store};
}

export const {persistor, store} = configureStore();