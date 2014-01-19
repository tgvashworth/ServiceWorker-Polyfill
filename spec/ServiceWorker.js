var hide = require('hide-key');
var CacheList = require('../spec/CacheList');
var chalk = require('chalk');

module.exports = ServiceWorker;

function ServiceWorker(workerUrl) {
    this._eventListeners = [];

    // TODO: replace this with a constructor param.
    // Something like _CacheLists should store a CacheList per origin
    this.caches = new CacheList();

    // TODO: work out why this is needed, hopefully remove
    this.caches.origin = workerUrl.origin;

    // importScripts requires execution context info, so it's handled in _Worker.js
    // this.importScripts = ...

    // this means we can get the version number via worker.scope.version
    // I'm not entirely sure why this works or why it doesn't work as
    // a normal property. vm weirdness. Maybe there's a better way.
    var _version = 0;
    Object.defineProperty(this, 'version', {
        get: function() { return _version; },
        set: function(val) { _version = val; }
    });
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
    // FIXME: does this need to be repeated? while (index = blah > -1)
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

ServiceWorker.prototype.console = Object.getOwnPropertyNames(console).reduce(function (memo, method) {
    memo[method] = console[method];
    if (typeof console[method] === "function") {
        memo[method] = memo[method].bind(console, chalk.blue('sw:'));
    }
    return memo;
}, Object.create(console));

ServiceWorker.prototype.setTimeout = setTimeout;
ServiceWorker.prototype.clearTimeout = clearTimeout;
ServiceWorker.prototype.setInterval = setInterval;
ServiceWorker.prototype.clearInterval = clearInterval;

ServiceWorker.prototype.Map = require('../spec/Map');
ServiceWorker.prototype.AsyncMap = require('../spec/AsyncMap');
ServiceWorker.prototype.Cache = require('../spec/Cache');
ServiceWorker.prototype.CacheList = require('../spec/CacheList');
ServiceWorker.prototype.Event = require('../spec/Event');
ServiceWorker.prototype.InstallEvent = require('../spec/InstallEvent');
ServiceWorker.prototype.FetchEvent = require('../spec/FetchEvent');
ServiceWorker.prototype.ActivateEvent = require('../spec/ActivateEvent');
ServiceWorker.prototype.MessageEvent = require('../spec/MessageEvent');
ServiceWorker.prototype.Response = require('../spec/Response');
ServiceWorker.prototype.SameOriginResponse = require('../spec/SameOriginResponse');
ServiceWorker.prototype.Request = require('../spec/Request');
ServiceWorker.prototype.fetch = require('../spec/fetch');
ServiceWorker.prototype.URL = require('dom-urls');
ServiceWorker.prototype.Promise = require('rsvp').Promise;