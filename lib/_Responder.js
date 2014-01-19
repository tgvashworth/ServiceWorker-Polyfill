var Promise = require('rsvp').Promise;
var Request = require('../spec/Request');
var Response = require('../spec/Response');
var URL = require('dom-urls');
var ResponsePromise = require('../spec/ResponsePromise');
var fetch = require('../spec/fetch');

module.exports = _Responder;

/**
 * The _Responder uses a ServiceWorker.Response to send it down a Node http.ServerResponse.
 */
function _Responder(request, _response) {
    this.request = request;
    this._response = _response;
}

_Responder.prototype.respond = function (response) {
    var headers = response.headers || {};

    var headArgs = [];
    if (typeof response.statusCode !== 'undefined') {
        headArgs.push(response.statusCode);
    }
    if (typeof response.statusText !== 'undefined') {
        headArgs.push(response.statusText);
    }
    headArgs.push(headers);

    this._response.writeHead.apply(this._response, headArgs);
    if (typeof response.body !== 'undefined') {
        this._response.write(response.body, (Buffer.isBuffer(response.body) ? 'binary' : 'utf8'))
    }
    this._response.end();
};

_Responder.prototype.respondWithNetwork = function () {
    this.request.headers['x-sent-from-responder'] = true;
    return fetch(this.request).then(this.respond.bind(this));
};
