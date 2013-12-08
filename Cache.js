var hide = require('./hide');
var Promise = require('promise');
var _PromiseFactory = require('./_PromiseFactory');
var Request = require('./Request');
var ResponsePromise = require('./ResponsePromise');
var CacheItemList = require('./CacheItemList');

var CacheError = require('./CacheError')

module.exports = Cache;

function Cache() {
    this.items = new CacheItemList();
    hide(this, '_isReady', false);

    var urls = [].slice.call(arguments);
    var reponsePromises = urls.map(function (url) {
        var request = new Request({
            url: url
        });
        return new ResponsePromise(request).then(function (response) {
            response.headers['X-From-Cache'] = true;
            return response;
        });
    });

    var _cacheReadyPromise =
        Promise.all(reponsePromises)
            .then(function (responses) {
                console.log('cache is ready');
                this._isReady = true;
                console.log('this._isReady', this._isReady);
                responses.forEach(function (response, index) {
                    this.items.set(urls[index], response);
                }.bind(this));
                return this.items;
            }.bind(this));
    hide(this, '_cacheReadyPromise', _cacheReadyPromise);
}

Cache.prototype.ready = function () {
    return this._cacheReadyPromise;
};

// FIXME: what happens if the request are still being made? Should we wait
// until they're ready to match?
Cache.prototype.match = function (url) {
    console.log('== matching ========================');
    console.log('url', url);
    console.log('this', this);
    console.log('this._isReady', this._isReady);
    console.log('this._cacheReadyPromise', this._cacheReadyPromise);
    if (!this._isReady) {
        console.log('not ready');
        return _PromiseFactory.RejectedPromise(new CacheError('Cache is not ready.'));
    }
    return this.ready().then(function () {
        console.log('ready, now matching');
        var match;
        this.items.every(function (response, key) {
            console.log('response', response);
            if (key.toString() === url.toString()) {
                match = response;
                return false;
            }
            return true;
        });
        if (!match) {
            console.log('Not found in cache.');
            throw new CacheError('Not found in cache');
        }
        console.log('Found in cache.');
        return match;
    }.bind(this));
};