var util = require('util');
var urlLib = require('url');
var Promise = require('promise');
var Request = require('./Request');
util.inherits(_ProxyRequest, Request);

module.exports = _ProxyRequest;

function _ProxyRequest(request) {
    // Restore the correct host to the request
    var url = urlLib.resolve('http://' + request.headers['x-original-host'], request.url);
    Request.call(this, {
        url: url,
        method: request.method,
        headers: request.headers,
        body: request.body
    });
    this.headers.host = request.headers['x-original-host'];
}
