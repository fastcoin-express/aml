import axios from 'axios'
/*
 global window
 */

const client = (() => {
    return axios.create({
        baseURL: window.env.FACE_API
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

    if (!window.env.AUTH_TOKEN) {
        return Promise.reject('NO AUTH TOKEN');
    }

    options.headers = {
        "Authorization": `${window.env.AUTH_METHOD} ${window.env.AUTH_TOKEN}`,
        'Accept': 'application/json;charset=utf-8',
        'Content-Type': 'application/json;charset=utf-8',
    };

    return client(options)
        .then(onSuccess)
        .catch(onError);
};


export default request;
