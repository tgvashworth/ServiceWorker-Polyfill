var util = require('util');
var hide = require('./_hide');
var Response = require('./Response');
var Promise = require('promise');
util.inherits(SameOriginResponse, Response);

module.exports = SameOriginResponse;

function SameOriginResponse(params) {
    Response.call(this, params);
}
