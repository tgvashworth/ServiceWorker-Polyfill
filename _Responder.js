var NetworkRequest = require('request');
var Promise = require('promise');
var urlLib = require('url');

module.exports = _Responder;

function _Responder(request, response) {
    this.request = request;
    this.response = response;
}

_Responder.prototype.respond = function (response) {
    console.log('responding with', response);
    var headers = response.headers;
    var body = response.body;
    if (typeof body !== 'undefined') {
        headers['Content-Length'] = Buffer.byteLength(body);
    }

    var headArgs = [];
    if (typeof response.statusCode !== 'undefined') {
        headArgs.push(response.statusCode);
    }
    if (typeof response.statusText !== 'undefined') {
        headArgs.push(response.statusText);
    }
    headArgs.push(headers);

    this.response.writeHead.apply(this.response, headArgs);
    if (typeof body !== 'undefined') {
        this.response.write(body);
    }
    this.response.end();
};

_Responder.prototype.respondWithNetwork = function () {
    this.goToNetwork().then(
        this.respond.bind(this)
    )
}

_Responder.prototype.goToNetwork = function () {
    var _responder = this;
    return new Promise(function (resolve, reject) {
        var url = urlLib.parse(_responder.request.url, true);
        var targetUrl = url.query.url;
        delete url.query.url;
        var requestConfig = {
            uri: targetUrl,
            qs: url.query,
            method: _responder.request.method,
            headers: _responder.request.headers,
            body: _responder.request.body
        };
        console.log('requestConfig', requestConfig);
        NetworkRequest(requestConfig, function (error, response) {
            if (error) return reject(error);
            resolve(response);
        });
    });
};