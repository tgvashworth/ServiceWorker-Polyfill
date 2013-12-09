var util = require('util');
var urlLib = require('url');
var Promise = require('promise');
var Request = require('./Request');
util.inherits(_ProxyRequest, Request);

module.exports = _ProxyRequest;

function _ProxyRequest(request) {
    var parsedUrl = urlLib.parse(request.url, true);
    var parsedTarget = parsedUrl;
    if (parsedUrl.query.url) {
        parsedTarget = urlLib.parse(parsedUrl.query.url, true);
    }
    Request.call(this, {
        url: urlLib.format(parsedTarget),
        method: request.method,
        headers: request.headers,
        body: request.body
    });
}
