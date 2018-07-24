export function appReducer(state = {}, action) {
    switch (action.type) {
        case "ADD_INSTANCE_ID":
            return {
                ...state,
                instanceID: action.payload,
                faceMatch: "",
                resultData: null
            };
        case "ADD_FACE_MATCH":
            return {
                ...state,
                instanceID: state.instanceID,
                faceMatch: action.payload,
                resultData: state.resultData
            };
        case "ADD_RESULT_DATA":
            return {
                ...state,
                instanceID: state.instanceID,
                faceMatch: state.faceMatch,
                resultData: action.payload
            };
        case "ADD_REDIRECT":
            return {
                
                instanceID: state.instanceID,
                faceMatch: "",
                resultData: null,
                redirect: action.payload,
            };
        default:
            return state;
    }
}