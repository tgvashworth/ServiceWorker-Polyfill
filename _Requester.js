var fs = require('fs');
var mime = require('mime');
var urlLib = require('url');
var _networkRequest = require('request');
var Promise = require('promise');
var Response = require('./Response');
var NetworkError = require('./NetworkError');
var SameOriginResponse = require('./SameOriginResponse');

module.exports = _Requester;

_Requester.origin = '';
_Requester.host = '';
_Requester.networkBase = '';

function _Requester(request) {
    return this.networkRequest(request);
}

_Requester.prototype.networkRequest = function (request) {
    return new Promise(function (resolve, reject) {
        var networkRequest = request;
        // Modify the request slightly for the proxy
        networkRequest.url = urlLib.resolve(_Requester.networkBase, request.url);
        networkRequest.headers.host = _Requester.host;
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