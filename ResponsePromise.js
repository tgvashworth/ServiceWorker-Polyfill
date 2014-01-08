var _Requester = require('./_Requester');
var Promise = require('rsvp').Promise;
var Response = require('./Response');

module.exports = ResponsePromise;

function ResponsePromise(request) {
    return new _Requester(request);
}