var fs = require('fs');
var mime = require('mime');
var urlLib = require('url');
var _networkRequest = require('request');
var Promise = require('promise');
var Response = require('./Response');
var NetworkError = require('./NetworkError');
var SameOriginResponse = require('./SameOriginResponse');

module.exports = _Requester;

_Requester.localOrigin = {};
_Requester.networkOrigin = {};

function _Requester(request) {
    return this.networkRequest(request);
}

_Requester.prototype.networkRequest = function (request) {
    return new Promise(function (resolve, reject) {
        var networkRequest = request;
        var parsedUrl = urlLib.parse(request.url);
        // Modify the request if this is a Same Origin request
        if (parsedUrl.host === _Requester.localOrigin.host) {
            networkRequest.headers.host = _Requester.networkOrigin.host;
            networkRequest.url = urlLib.resolve(_Requester.networkOrigin.base, parsedUrl.path);
        }
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