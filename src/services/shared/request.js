import axios from 'axios'
//import {store} from './../../store';
/*
 global window
 */
const token = 'Basic YW5kcmVpQG9rYXBpc3R1ZGlvLmNvbTp6NmswdmhrYjRnMmJkMmFj';
const client = (() => {
    return axios.create({
        baseURL: "https://services.assureid.net"
    });
})();



const request = function(options, store) {
    const onSuccess = function(response) {
        console.debug('Request Successful!', response);
        return response.data;
    }

    const onError = function(error) {
        return Promise.reject(error.response || error.message);
    };

    options.headers = {
        "Authorization": token,
    };

    return client(options)
        .then(onSuccess)
        .catch(onError);
};


export default request;
