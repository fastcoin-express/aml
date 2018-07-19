import request from '../shared/request';

function getDocInstance() {
    return request({
        url: '/AssureIDService/Document/Instance',
        method: "POST",
        data: {
            "AuthenticationSensitivity": 0,
            "ClassificationMode": 0,
            "Device": {
                "HasContactlessChipReader": false,
                "HasMagneticStripeReader": false,
                "SerialNumber": "xxx",
                "Type": {
                    "Manufacturer": "xxx",
                    "Model": "xxx",
                    "SensorType": 3,
                }
            },
            "ImageCroppingExpectedSize": 0,
            "ImageCroppingMode": 3,
            "ManualDocumentType": null,
            "ProcessMode": 0,
            "SubscriptionId": "c0232aba-54ac-48ae-b670-c7e215dadb49"
        }
    });
}

function postFrontImage(instanceID, file) {
    return request({
        url: '/AssureIDService/Document/' + instanceID + '/Image?side=0&light=0&metrics=true',
        method: 'POST',
        data: file
    });
}

function getFrontImage(instanceID) {
    return request({
        url: '/AssureIDService/Document/' + instanceID + '/Image?side=0&light=0',
        method: 'GET',
        responseType: 'arraybuffer'
    });
}

function getImageQualityMetric(instanceID) {
    return request({
        url: '/AssureIDService/Document/' + instanceID + '/Image/Metrics?side=0&light=0',
        method: 'GET',
    });
}

function getFaceImage(instanceID) {
    return request({
        url: '/AssureIDService/Document/' + instanceID + '/Field/Image?key=Photo',
        method: 'GET',
        responseType: 'arraybuffer'
    });
}

function getSignatureImage(instanceID) {
    return request({
        url: '/AssureIDService/Document/' + instanceID + '/Field/Image?key=Signature',
        method: 'GET',
        responseType: 'arraybuffer'
    });
}

function getResults(instanceID) {
    return request({
        url: '/AssureIDService/Document/' + instanceID,
        method: 'GET',
    });
}


const ApiService = {
    getDocInstance, postFrontImage, getFrontImage, getImageQualityMetric, getFaceImage, getResults, getSignatureImage
};

export default ApiService;