var util = require('util');
var Cache = require('../spec/Cache');
var AsyncMap = require('../spec/AsyncMap');
var Promise = require('rsvp').Promise;

util.inherits(CacheList, AsyncMap);
module.exports = CacheList;

function CacheList() {
    AsyncMap.apply(this, arguments);
    this.origin = 'none://none';
}

CacheList.prototype.set = function (key, cache) {
    if (!(cache instanceof Cache)) {
        throw Error('CacheList only accepts Caches.');
    }
    return AsyncMap.prototype.set.call(this, key, cache);
};

CacheList.prototype.ready = function () {
    return Promise.all(this.items().map(function (cachePromise, cacheName) {
        return cachePromise.then(function (cache) {
            return cache.ready();
        });
    }));
};

CacheList.prototype.match = function (url) {
    return Promise.all(this.items().map(function (cachePromise) {
        return cachePromise.then(function (cache) {
            return cache.match(url);
        });
    })).then(function (matches) {
        return matches[0];
    });
};