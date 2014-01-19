var util = require('util');
var Promise = require('rsvp').Promise;
var Event = require('../spec/Event');
var hide = require('hide-key');

util.inherits(InstallPhaseEvent, Event);
module.exports = InstallPhaseEvent;

function InstallPhaseEvent(type) {
    Event.call(this, type);
    hide(this, '_wait', Promise.resolve());
}

InstallPhaseEvent.prototype.waitUntil = function (promise) {
    // FIXME: propagation? preventDefault?
    this.stopImmediatePropagation();
    this._wait = Promise.cast(promise);
    return this._wait;
};