var hide = require('hide-key');

module.exports = Event;

function Event(type) {
    if (typeof type === 'undefined') {
        throw new TypeError('Failed to construct \'Event\': An event name must be provided.');
    }
    hide(this, '_type', type);
    this.type = type;
    this.timeStamp = Date.now();
    this.defaultPrevented = false;
    this.propagationStopped = false;
    this.immediatePropagationStopped = false;
}

Event.prototype.preventDefault = function () {
    this.defaultPrevented = true;
};

Event.prototype.stopPropagation = function () {
    this.propagationStopped = true;
};

Event.prototype.stopImmediatePropagation = function () {
    this.immediatePropagationStopped = true;
};

Event.prototype._isStopped = function () {
    return this.immediatePropagationStopped ||
           this.propagationStopped ||
           this.defaultPrevented;
}