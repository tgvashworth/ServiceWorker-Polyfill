var util = require('util');
var Promise = require('promise');
var Event = require('./Event');
util.inherits(InstallEvent, Event);

module.exports = InstallEvent;

function InstallEvent() {
    Event.call(this, 'install');
    this.services = [];
}

// FIXME: this feels weird
InstallEvent.prototype._install = function () {
    var installEvent = this;
    return new Promise(function (resolve, reject) {
        installEvent._installResolve = resolve.bind(this);
        installEvent._installRegect = reject.bind(this);
    });
};

InstallEvent.prototype.waitUntil = function () {
    [].forEach.call(arguments, function (arg) {
        if (!arg instanceof Promise) {
            throw new TypeError('Arguments to waitUntil must be a Promise.')
        }
    });

    return Promise.all([].slice.call(arguments)).then(
        this._installResolve,
        this._installReject
    );
};