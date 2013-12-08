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
                this._isReady = true;
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
    if (!this._isReady) {
        return _PromiseFactory.RejectedPromise(new CacheError('Cache is not ready.'));
    }
    return this.ready().then(function () {
        var match;
        this.items.every(function (response, key) {
            if (key.toString() === url.toString()) {
                match = response;
                return false;
            }
            return true;
        });
        if (!match) {
            throw new CacheError('Not found in cache');
        }
        return match;
    }.bind(this));
};