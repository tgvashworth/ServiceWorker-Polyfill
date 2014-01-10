var hide = require('hide-key');
var Promise = require('rsvp').Promise;
var path = require('path');
var AsyncMap = require('../spec/AsyncMap');
var URL = require('dom-urls');

module.exports = Cache;

// These should be overwritten
Cache.ValuePromise = Promise;
Cache.valueFromKey = function (key) {
    return {
        url: new URL(key)
    };
};
Cache.transformValue = null;

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

    var cacheableValuePromise = this.persistValuePromise(key, valuePromise)
        .then(Cache.transformValue)
        .then(this.persistvalue.bind(this, key));

    return this.items.set(key, cacheableValuePromise);
};

// TODO these should be overwritten or defer to somewhere else
Cache.prototype.persistValuePromise = function (key, valuePromise) {
    return valuePromise;
};

Cache.prototype.persistvalue = function (key, value) {
    return value;
};