var util = require('util');
var hide = require('./hide');
var instanceOf = require('./instanceOf');
var Cache = require('./Cache');
var Promise = require('promise');

module.exports = CacheList;

function CacheList() {
    hide(this, '_cacheIndexMap', {});
    hide(this, '_cacheList', []);
}

CacheList.prototype.ready = function () {
    return Promise.all(this._cacheList.map(function (cache) {
        return cache.ready();
    }));
};

CacheList.prototype.match = function () {};

CacheList.prototype.get = function (key) {
    return this._cacheList[this._cacheIndexMap[key]];
};

CacheList.prototype.set = function (key, value) {
    if (!instanceOf(value, Cache)) {
        throw new TypeError('CacheList value must be a Cache.');
    }
    var len = this._cacheList.push(value);
    this._cacheIndexMap[key] = len - 1;
};

CacheList.prototype.forEach = function (callback, ctx) {
    var cacheMap = this.keys.reduce(function (memo, key) {
        memo[key] = this.get(key);
        return memo;
    }.bind(this), {});

    return this.keys.forEach(function (key) {
        var cache = this.get(key);
        return callback.call(ctx || cache, cache, key, cacheMap);
    }.bind(this));
};

Object.defineProperty(CacheList.prototype, 'values', {
    get: function () {
        return [].slice.call(this._cacheList);
    }
});

Object.defineProperty(CacheList.prototype, 'keys', {
    get: function () {
        return Object.keys(this._cacheIndexMap);
    }
});

Object.defineProperty(CacheList.prototype, 'items', {
    get: function () {
        return this.values;
    }
});

Object.defineProperty(CacheList.prototype, 'size', {
    get: function () {
        return this._cacheList.length;
    }
});