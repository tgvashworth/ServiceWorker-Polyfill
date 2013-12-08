var Promise = require('promise');
var urlLib = require('url');
var Request = require('./Request');
var Response = require('./Response');
var ResponsePromise = require('./ResponsePromise');

module.exports = _Responder;

function _Responder(request, response) {
    this.request = request;
    this.response = response;
}

_Responder.prototype.respond = function (response) {
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
    return this.goToNetwork().then(
        this.respond.bind(this)
    );
}

_Responder.prototype.goToNetwork = function () {
    var parsedUrl = urlLib.parse(this.request.url, true);
    var parsedTarget = urlLib.parse(parsedUrl.query.url, true);
    var request = new Request({
        url: urlLib.format(parsedTarget),
        method: this.request.method,
        headers: this.request.headers,
        body: this.request.body
    });
    return new ResponsePromise(request);
};