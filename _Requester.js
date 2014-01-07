var fs = require('fs');
var mime = require('mime');
var _networkRequest = require('request');
var Promise = require('promise');
var Response = require('./Response');
var NetworkError = require('./NetworkError');
var SameOriginResponse = require('./SameOriginResponse');
var URL = require('dom-urls');

module.exports = _Requester;

function _Requester(request) {
    return this.networkRequest(request);
}

_Requester.prototype.networkRequest = function (request) {
    return new Promise(function (resolve, reject) {
        var networkRequest = request;
        // Modify the request if this is a Same Origin request
        // if (request.url.host === _Requester.localOrigin.host) {
        //     networkRequest.headers.host = _Requester.networkOrigin.host;
        //     networkRequest.url = new URL(request.url.path, _Requester.networkOrigin.base);
        // }
        // Convert from URL type back to string for requestin'
        networkRequest.url = networkRequest.url.toString();
        _networkRequest(networkRequest, function (err, rawResponse) {
            if (err) {
                return reject(new NetworkError(new Response({
                    statusCode: 404,
                    statusText: 'Network failure: ' + err.code,
                    method: networkRequest.method
                })));
            }
            // method comes back null
            rawResponse.method = networkRequest.method;
            var response = new Response(rawResponse);
            if (response.statusCode >= 400) {
                return reject(new NetworkError(response));
            }
            resolve(response);
        });
    });
};