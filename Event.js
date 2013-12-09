var hide = require('./hide');

module.exports = Event;

function Event(type) {
    if (typeof type === 'undefined') {
        throw new TypeError('Failed to construct \'Event\': An event name must be provided.');
    }

    hide(this, '_type', type);
    this.type = type;
    this.timeStamp = Date.now();
    this.propagationStopped = false;
    this.immediatePropagationStopped = false;
}

Event.prototype.stopPropagation = function () {
    this.propagationStopped = true;
};

Event.prototype.stopImmediatePropagation = function () {
    this.immediatePropagationStopped = true;
};

Event.prototype.preventDefault = function () {
    this.defaultPrevented = true;
};