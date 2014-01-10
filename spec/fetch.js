var ResponsePromise = require('../spec/ResponsePromise');
var Request = require('../spec/Request');
var Response = require('../spec/Response');
var URL = require('dom-urls');
var _networkRequest = require('request');

module.exports = function (request) {
    if (!(request instanceof Request)) {
        request = new Request({
            url: new URL(request)
        });
    }
    var networkRequest = new Request(request);
    // Delete caching headers
    delete networkRequest.headers['If-Modified-Since'];
    delete networkRequest.headers['if-modified-since'];
    delete networkRequest.headers['If-None-Match'];
    delete networkRequest.headers['if-none-match'];
    delete networkRequest.headers['Cache-Control'];
    delete networkRequest.headers['cache-control'];
    // Convert from URL type back to string for requestin'
    networkRequest.url = networkRequest.url.toString();
    networkRequest.encoding = null;
    return new ResponsePromise(function (resolve, reject) {
        return _networkRequest(networkRequest, function (err, rawResponse, body) {
            if (err) {
                return reject(err);
            }
            var response = new Response({
                method: request.method,
                statusCode: rawResponse.statusCode,
                headers: rawResponse.headers,
                body: body
            });
            resolve(response);
        });
    });
};