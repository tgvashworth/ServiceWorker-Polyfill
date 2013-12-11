var util = require('util');
var urlLib = require('url');
var Promise = require('promise');
var Request = require('./Request');
util.inherits(_ProxyRequest, Request);

module.exports = _ProxyRequest;

function _ProxyRequest(request) {
    Request.call(this, {
        url: request.url,
        method: request.method,
        headers: request.headers,
        body: request.body
    });
}
