var hide = require('./hide');

module.exports = ServiceWorker;

function ServiceWorker() {
    hide(this, 'eventListeners', []);
    this.version = 0;
}

ServiceWorker.prototype.addEventListener = function (type, listener) {
    this.eventListeners[type] || (this.eventListeners[type] = []);
    this.eventListeners[type].push(listener);
};

ServiceWorker.prototype.removeEventListener = function (type, listener) {
    this.eventListeners[type] || (this.eventListeners[type] = []);
    var index = this.eventListeners[type].indexOf(listener);
    if (index < 0) return;
    this.eventListeners[type].splice(index, 1);
};

ServiceWorker.prototype.dispatchEvent = function (event) {
    this.eventListeners[event.type] || (this.eventListeners[event.type] = []);
    this.eventListeners[event.type].some(function (listener) {
        listener.call(this, event);
        return (!event.propagationStopped && !event.immediatePropagationStopped);
    }.bind(this));
};

