var hide = require('./hide');
var Promise = require('promise');
var _PromiseFactory = require('./_PromiseFactory');
var _instanceOf = require('./_instanceOf');

var Request = require('./Request');
var Response = require('./Response');
var ResponsePromise = require('./ResponsePromise');

var CacheItemList = require('./CacheItemList');
var CacheError = require('./CacheError')

module.exports = Cache;

function Cache() {
    this.items = new CacheItemList();
    hide(this, '_isReady', false);
    hide(this, '_cacheResponsePromises', []);

    var urls = [].slice.call(arguments);
    urls.forEach(this.add.bind(this));
}

Cache.prototype.ready = function () {
    return Promise.all(this._cacheResponsePromises).then(function (responses) {
        this._isReady = true;
        return responses;
    }.bind(this));
};

// FIXME: what happens if the request are still being made? Should we wait
// until they're ready to match?
Cache.prototype.match = function (key) {
    if (!this._isReady) {
        console.log('cache not ready')
        return _PromiseFactory.RejectedPromise(new CacheError('Cache is not ready.'));
    }
    return this.ready().then(function () {
        console.log('ready to match!');
        console.log('== matching ========================');
        var match;
        this.items.every(function (response, itemKey) {
            console.log('itemKey :', itemKey);
            console.log('key     :', key);
            if (itemKey.toString() === key.toString()) {
                console.log('=== match!!!');
                match = response;
                return false;
            }
            return true;
        });
        console.log('== /matching ========================');
        console.log('match', match);
        if (!match) {
            throw new CacheError('Not found in cache');
        }
        return match;
    }.bind(this));
};

Cache.prototype.add = function (key, response) {
    if (typeof response !== "undefined" &&
        _instanceOf(response, Response)) {
        var newResponse = new Response(response);
        newResponse.headers['X-Cache-Hit'] = true;
        newResponse.headers['X-Cache-Key'] = key;
        return this.items.set(key, newResponse);
    }
    // _instanceOf Request could work here
    var request = new Request({
        url: key
    });
    var responsePromise = new ResponsePromise(request).then(function (response) {
        response.headers['X-Cache-Hit'] = true;
        response.headers['X-Cache-Key'] = key;
        this.items.set(key, response);
        return response;
    }.bind(this));
    this._cacheResponsePromises.push(responsePromise);
    this._isReady = false;
    return responsePromise;
};