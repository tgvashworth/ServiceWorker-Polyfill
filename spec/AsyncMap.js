var util = require('util');
var hide = require('hide-key');
var Map = require('../spec/Map.js');
var Promise = require('rsvp').Promise;

util.inherits(AsyncMap, Map);
module.exports = AsyncMap;

function AsyncMap() {
    Map.apply(this, arguments);
}

AsyncMap.prototype.get = function (key) {
    key = key.toString();
    if (!this.has(key)) {
        return Promise.reject();
    }
    return Map.prototype.get.call(this, key);
};

AsyncMap.prototype.set = function (key, valuePromise) {
    key = key.toString();
    if (!(valuePromise instanceof Promise)) {
        valuePromise = Promise.resolve(valuePromise);
    }
    Map.prototype.set.call(this, key, valuePromise)
    // TODO this should return a persist promise
    return valuePromise;
};