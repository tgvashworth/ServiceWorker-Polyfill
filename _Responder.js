var Promise = require('promise');
var Request = require('./Request');
var _ProxyRequest = require('./_ProxyRequest');
var Response = require('./Response');
var ResponsePromise = require('./ResponsePromise');

module.exports = _Responder;

/**
 * The _Responder uses a ServiceWorker.Response to send it down a Node http.ServerResponse.
 */
function _Responder(request, _response, requestType) {
    this.request = request;
    this._response = _response;
    this.requestType = requestType;
}

_Responder.prototype.respond = function (response) {
    var headers = response.headers || {};
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

    this._response.writeHead.apply(this._response, headArgs);
    if (typeof body !== 'undefined') {
        this._response.write(body.toString());
    }
    this._response.end();

    return response;
};

_Responder.prototype.respondWithNetwork = function () {
    return this.goToNetwork().then(
        this.respond.bind(this),
        function (why) {
            console.error('goToNetwork error:', why);
            if (why.response) {
                // There was a network error, but we got something back
                // so roll with it. I'm sure this can be cleaned up.
                // FIXME: caching this could be really bad.
                return this.respond(new Response(why.response));
            } else {
                throw why;
            }
        }.bind(this)
    );
}

_Responder.prototype.goToNetwork = function () {
    this.request.headers['x-sent-from-responder'] = true;
    this.request.headers['x-original-url'] = this.request.url;
    return new ResponsePromise(this.request);
};