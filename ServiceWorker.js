var hide = require('hide-key');
var CacheList = require('./CacheList');

module.exports = ServiceWorker;

function ServiceWorker(_messenger) {
    hide(this, '_eventListeners', []);
    hide(this, '_messenger', _messenger);
    this.version = 0;
    this.caches = new CacheList();
}

/**
 * Event listeners
 */

ServiceWorker.prototype.addEventListener = function (type, listener) {
    this._eventListeners[type] || (this._eventListeners[type] = []);
    this._eventListeners[type].push(listener);
};

ServiceWorker.prototype.removeEventListener = function (type, listener) {
    this._eventListeners[type] || (this._eventListeners[type] = []);
    // FIME does this need to be repeated? while (index = blah > -1)
    var index = this._eventListeners[type].indexOf(listener);
    if (index < 0) return;
    this._eventListeners[type].splice(index, 1);
};

ServiceWorker.prototype.dispatchEvent = function (event) {
    this._eventListeners[event._type] || (this._eventListeners[event._type] = []);
    this._eventListeners[event._type].some(function (listener) {
        listener.call(this, event);
        return event._isStopped();
    }.bind(this));
};

/**
 * Messaging
 */

ServiceWorker.prototype.postMessage = function (data) {
    this._messenger.postMessage(data);
};