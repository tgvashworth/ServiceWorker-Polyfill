var Promise = require('rsvp').Promise;
var URL = require('dom-urls');
var util = require('util');

util.inherits(ResponsePromise, Promise);
module.exports = ResponsePromise;

function ResponsePromise() {
    Promise.apply(this, arguments);
}

Object.keys(Promise).forEach(function (key) {
    ResponsePromise[key] = Promise[key];
});
