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

InstallPhaseEvent.prototype.waitUntil = function () {
    [].forEach.call(arguments, function (arg) {
        if (!arg instanceof Promise) {
            throw new TypeError('Arguments to waitUntil must be Promises.');
        }
    });

    // FIXME: propagation? preventDefault?
    this.stopImmediatePropagation();

    this._wait = Promise.all([].slice.call(arguments)).then(
        this._resolve,
        this._reject
    );

    return this._wait;
};