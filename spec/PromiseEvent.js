var util = require('util');
var Promise = require('rsvp').Promise;
var Event = require('../spec/Event');
var hide = require('hide-key');

util.inherits(PromiseEvent, Event);
module.exports = PromiseEvent;

function PromiseEvent(type) {
    Event.call(this, type);
    hide(this, '_wait', Promise.resolve());
}

PromiseEvent.prototype.waitUntil = function () {
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