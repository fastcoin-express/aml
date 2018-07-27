import axios from 'axios'
/*
 global window
 */

const client = (() => {
    return axios.create({
        baseURL: process.env.REACT_APP_FACE_API
    });
})();

const request = function(options, store) {
    const onSuccess = function(response) {
        console.debug('Request Successful!', response);
        return response.data;
    };

    const onError = function(error) {
        return Promise.reject(error.response || error.message);
    };

    let AUTH_TOKEN = btoa(`${process.env.REACT_APP_USER_NAME}:${process.env.REACT_APP_USER_PASSWORD}`);

    options.headers = {
        "Authorization": `${process.env.REACT_APP_AUTH_METHOD} ${AUTH_TOKEN}`,
        'Accept': 'application/json;charset=utf-8',
        'Content-Type': 'application/json;charset=utf-8',
    };

    return client(options)
        .then(onSuccess)
        .catch(onError);
};


export default request;
