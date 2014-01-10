var util = require('util');
var Map = require('../spec/Map');
var Promise = require('rsvp').Promise;
util.inherits(CacheList, Map);

module.exports = CacheList;

function CacheList() {
    Map.call(this);
}

CacheList.prototype.ready = function () {
    return Promise.all(this.items.map(function (cache, cacheName) {
        return cache.ready();
    }));
};

CacheList.prototype.match = function (url) {
    return Promise.all(this.items.map(function (cache) {
        return cache.match(url);
    })).then(function (matches) {
        return matches[0];
    });
};