var Promise = require('promise');
var urlLib = require('url');
var Request = require('./Request');
var _ProxyRequest = require('./_ProxyRequest');
var Response = require('./Response');
var ResponsePromise = require('./ResponsePromise');

module.exports = _Responder;

function _Responder(request, response, requestIsNavigate) {
    this.request = request;
    this.response = response;
    this.requestType = (requestIsNavigate ? 'navigate' : 'fetch');
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

    return response;
};

_Responder.prototype.respondWithNetwork = function () {
    return this.goToNetwork().then(
        this.respond.bind(this),
        function (why) {
            // There was a network error, but we got something back
            // so roll with it. I'm sure this can be cleaned up.
            // FIXME: caching this could be really bad.
            return this.respond(new Response(why.response));
        }.bind(this)
    );
}

_Responder.prototype.goToNetwork = function () {
    var request = new _ProxyRequest(this.request);
    request.headers['x-sent-from-responder'] = true;
    request.headers['x-original-url'] = request.url;
    return new ResponsePromise(request);
};