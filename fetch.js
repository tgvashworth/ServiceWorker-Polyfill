var _Requester = require('./_Requester');
var _instanceOf = require('./_instanceOf');
var _ProxyRequest = require('./_ProxyRequest');
var Request = require('./Request');
var URL = require('dom-urls');

module.exports = function (url) {
    var request = url;
    if (!_instanceOf(request, Request)) {
        request = new Request({
            url: new URL(url)
        });
    }
    return new _Requester(request);
};