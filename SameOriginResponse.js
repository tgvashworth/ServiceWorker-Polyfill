var util = require('util');
var hide = require('hide-key');
var Response = require('./Response');
var Promise = require('rsvp').Promise;
util.inherits(SameOriginResponse, Response);

module.exports = SameOriginResponse;

function SameOriginResponse(params) {
    Response.call(this, params);
}
