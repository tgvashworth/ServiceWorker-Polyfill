var util = require('util');
var hide = require('hide-key');
var _instanceOf = require('../lib/_instanceOf');
var Event = require('../spec/Event');
var Response = require('../spec/Response');
var SameOriginResponse = require('../spec/SameOriginResponse');
var Promise = require('rsvp').Promise;
util.inherits(MessageEvent, Event);

module.exports = MessageEvent;

function MessageEvent(data, origin) {
    Event.call(this, 'message');
    this.data = data;
    this.origin = origin;
}
