var util = require('util');
var hide = require('hide-key');
var Cache = require('../spec/Cache');
var URL = require('dom-urls');
var AsyncMap = require('../spec/AsyncMap');
var Promise = require('rsvp').Promise;
var _Storage = require('../lib/_Storage');

util.inherits(CacheList, AsyncMap);
module.exports = CacheList;

CacheList.makeNamespace = function (origin) {
    return origin
        .replace('//', '')
        .replace(/[^a-z0-9]/ig, '-')
        .replace(/\-{2,}/g, '');
};

/**
 * CacheList
 */

function CacheList(url) {
    AsyncMap.apply(this, arguments);
    url = new URL(url);
    this.origin = url.protocol + '//' + url.host;
    hide(this, '_namespace', CacheList.makeNamespace(this.origin));
    hide(this, '_storage', new _Storage(this._namespace));
    this._storage.init({
        caches: []
    });
    console.log('this._namespace', this._namespace);
    console.log('this._storage', this._storage);
}

/**
 * Add a cache to the CacheList. This adds a reference to the cache on the heap, not the cache
 * itself. We then wrap get to dereference it.
 */
CacheList.prototype.set = function (key, cache) {
    if (!(cache instanceof Cache)) {
        throw Error('CacheList only accepts Caches.');
    }
    console.log('== CacheList#set ========================');
    return this._storage.readyPromise
        .then(function (data) {
            data.caches.push({
                key: key,
                cache: this._storage.reference(cache)
            });
            console.log('data.caches', data.caches);
            return this._storage.persist(data);
        }.bind(this)).then(function () {
            return AsyncMap.prototype.set.call(this, key, cache);
        }.bind(this))
        .catch(function (why) {
            console.error(why);
        });
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