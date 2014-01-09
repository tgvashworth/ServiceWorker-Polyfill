var ResponsePromise = require('../spec/ResponsePromise');
var _instanceOf = require('../lib/_instanceOf');
var Request = require('../spec/Request');
var URL = require('dom-urls');

module.exports = function (url) {
    var request = url;
    if (!_instanceOf(request, Request)) {
        request = new Request({
            url: new URL(url)
        });
    }
    return new ResponsePromise(request);
};