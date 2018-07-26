import axios from 'axios'
/*
 global window
 */

const client = (() => {
    return axios.create({
        baseURL: window.env.ID_SCAN_GO_API
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

    let AUTH_TOKEN = btoa(`${window.env.USER_NAME}:${window.env.USER_PASSWORD}`);

    options.headers = {
        "Authorization": `${window.env.AUTH_METHOD} ${AUTH_TOKEN}`,
    };

    return client(options)
        .then(onSuccess)
        .catch(onError);
};


export default request;
