var hide = require('hide-key');
var Promise = require('rsvp').Promise;
var path = require('path');
var AsyncMap = require('../spec/AsyncMap');
var Request = require('../spec/Request');
var fetch = require('../spec/fetch');
var URL = require('dom-urls');

module.exports = Cache;

/**
 * Static
 */

Cache.promiseFromValue = function (value) {
    return fetch(value);
};
Cache.valueFromKey = function (key) {
    return new Request({
        url: key
    });
};
Cache.transformValue = function (response) {
    response.headers['X-Service-Worker-Cache'] = 'HIT';
    return response;
};

// TODO these should be overwritten or defer to somewhere else
Cache.persistValuePromise = function (key, valuePromise) {
    return valuePromise;
};

Cache.persistValue = function (key, value) {
    return value;
};

/**
 * Cache
 */

function Cache() {
    this.items = new AsyncMap();
    var args = [].slice.call(arguments);
    args.forEach(function (url) {
        this.add(new URL(url));
    }, this);
}

Cache.prototype.ready = function () {
    return Promise.all(this.items.values());
};

Cache.prototype.match = function (key) {
    key = key.toString();
    return this.items.get(key);
};

Cache.prototype.add = function (key, valuePromise) {
    key = key.toString();
    if (typeof valuePromise === "undefined") {
        valuePromise = Cache.promiseFromValue(Cache.valueFromKey(key));
    } else if (!(valuePromise instanceof Promise)) {
        valuePromise = Promise.resolve(valuePromise);
    }

    var cacheableValuePromise = Cache.persistValuePromise(key, valuePromise)
        .then(Cache.transformValue)
        .then(Cache.persistValue.bind(this, key));

    return this.items.set(key, cacheableValuePromise);
};