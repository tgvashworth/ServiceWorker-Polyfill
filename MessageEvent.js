var util = require('util');
var hide = require('hide-key');
var _instanceOf = require('./_instanceOf');
var Event = require('./Event');
var Response = require('./Response');
var SameOriginResponse = require('./SameOriginResponse');
var Promise = require('promise');
util.inherits(MessageEvent, Event);

module.exports = MessageEvent;

function MessageEvent(data) {
    Event.call(this, 'message');
    this.data = data;
}
