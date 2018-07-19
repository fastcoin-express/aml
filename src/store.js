import storage from "redux-persist/es/storage";
import {persistReducer, persistStore} from "redux-persist";
import {createStore} from 'redux';

const initialState = {
    instanceID: 'asdasd',
    faceMatch: '',
    resultData: null
};

const reducerr = (state = initialState, action) => {
    switch (action.type) {
        case "ADD_INSTANCE_ID":
            return {
                instanceID: action.text,
                faceMatch: "",
                resultData: null
            };
        case "ADD_FACE_MATCH":
            return {
                instanceID: state.instanceID,
                faceMatch: action.text,
                resultData: state.resultData
            };
        case "ADD_RESULT_DATA":
            return {
                instanceID: state.instanceID,
                faceMatch: state.faceMatch,
                resultData: action.text
            };
        case "ADD_REDIRECT":
            return {
                instanceID: state.instanceID,
                faceMatch: "",
                resultData: null,
                redirect: action.text,
            };
        default:
            return state;
    }
}

const config = {
    key: 'idscango',
    storage,
    whitelist: 'instanceID, faceMatch, resultData'
};

const reducer = persistReducer(config, (reducerr));

function configureStore() {
    let store = createStore(
        reducer,
        initialState
    );
    let persistor = persistStore(store);
    return {persistor, store};
}

export const {persistor, store} = configureStore();