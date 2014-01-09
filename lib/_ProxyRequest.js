var util = require('util');
var Promise = require('rsvp').Promise;
var Request = require('../spec/Request');
var URL = require('dom-urls');
util.inherits(_ProxyRequest, Request);

module.exports = _ProxyRequest;

function _ProxyRequest(request) {
    // Restore the correct host to the request
    Request.call(this, {
        url: new URL(request.path, 'http://' + request.headers['x-original-host']),
        method: request.method,
        headers: request.headers,
        body: request.body
    });
    this.headers.host = request.headers['x-original-host'];
}
