var hide = require('hide-key');
var CacheList = require('../spec/CacheList');
var importScripts = require('../spec/importScripts');
var chalk = require('chalk');

module.exports = ServiceWorker;

function ServiceWorker(workerUrl) {
    this._eventListeners = [];
    this.version = 0;
    this.caches = new CacheList();
    this.caches.origin = workerUrl.origin;
    this.importScripts = importScripts(workerUrl);
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