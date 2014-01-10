var Map = require('../spec/Map');
var util = require('util');
var hide = require('hide-key');
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
    valuePromise = Promise.cast(valuePromise);
    Map.prototype.set.call(this, key, valuePromise);
    return valuePromise;
};