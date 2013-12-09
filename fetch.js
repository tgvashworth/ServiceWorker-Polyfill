var _Requester = require('./_Requester');
var _instanceOf = require('./instanceOf');
var Request = require('./Request');
var _ProxyRequest = require('./_ProxyRequest');

module.exports = function (url) {
    var request = url;
    if (!_instanceOf(request, Request)) {
        request = new _ProxyRequest({
            url: url
        });
    }
    return new _Requester(request);
};