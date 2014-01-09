var _Requester = require('../lib/_Requester');
var Promise = require('rsvp').Promise;
var Response = require('../spec/Response');
var Request = require('../spec/Request');
var URL = require('dom-urls');

module.exports = ResponsePromise;

function ResponsePromise(request) {
    request = new Request(request);
    return new Promise(function (resolve, reject) {
        var reqStream = _Requester.makeRequest(request, function (err, rawResponse, body) {
            if (err) {
                return reject(err);
            }
            request.url = new URL(request.url);
            var response = new Response({
                method: request.method,
                statusCode: rawResponse.statusCode,
                headers: rawResponse.headers,
                body: body
            });
            resolve(response);
        });
    });
}