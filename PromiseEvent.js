var util = require('util');
var Promise = require('rsvp').Promise;
var Event = require('./Event');
var hide = require('hide-key');

util.inherits(PromiseEvent, Event);
module.exports = PromiseEvent;

function PromiseEvent(type, resolve, reject) {
    if (!(type && resolve && reject)) {
        throw new Error('PromiseEvent requires a type and promise/reject callbacks.');
    }
    Event.call(this, type);
    hide(this, '_resolve', resolve);
    hide(this, '_reject', reject);
}

PromiseEvent.prototype.waitUntil = function () {
    [].forEach.call(arguments, function (arg) {
        if (!arg instanceof Promise) {
            throw new TypeError('Arguments to waitUntil must be Promises.')
        }
    });

    // FIXME: propagation? preventDefault?
    this.stopImmediatePropagation();

    return Promise.all([].slice.call(arguments)).then(
        this._resolve,
        this._reject
    );
};