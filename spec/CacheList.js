var util = require('util');
var Cache = require('../spec/Cache');
var Map = require('../spec/Map');
var Promise = require('rsvp').Promise;

util.inherits(CacheList, Map);
module.exports = CacheList;

function CacheList() {
    Map.apply(this, arguments);
    this.origin = 'none://none';
}

CacheList.prototype.set = function (key, cache) {
    if (!(cache instanceof Cache)) {
        throw Error('CacheList only accepts Caches.');
    }
    return Map.prototype.set.call(this, key, cache);
};

CacheList.prototype.ready = function () {
    return Promise.all(this.items().map(function (cache, cacheName) {
        return cache.ready();
    }));
};

CacheList.prototype.match = function (url) {
    return Promise.all(this.items().map(function (cache) {
        return cache.match(url);
    })).then(function (matches) {
        return matches[0];
    });
};