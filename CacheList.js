var util = require('util');
var urlLib = require('url');
var AsyncMap = require('./AsyncMap');
var Promise = require('promise');
util.inherits(CacheList, AsyncMap);

module.exports = CacheList;

function CacheList() {
    AsyncMap.call(this);
}

CacheList.prototype.ready = function () {
    return Promise.all(this._list.map(function (cache) {
        return cache.ready();
    }));
};

CacheList.prototype.match = function (url) {
    return Promise.all(this._list.map(function (cache) {
        return cache.match(url);
    })).then(function (matches) {
        return matches[0];
    });
};