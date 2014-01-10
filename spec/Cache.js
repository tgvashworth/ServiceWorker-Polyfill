var hide = require('hide-key');
var Promise = require('rsvp').Promise;

var Request = require('../spec/Request');
var Response = require('../spec/Response');
var ResponsePromise = require('../spec/ResponsePromise');

var CacheItemList = require('../spec/CacheItemList');
var CacheError = require('../spec/CacheError');

module.exports = Cache;

function Cache() {
    this.items = new CacheItemList();
    var urls = [].slice.call(arguments);
    urls.forEach(this.add.bind(this));
}

Cache.prototype.ready = function () {
    return Promise.all(this.items.values);
};

Cache.prototype.match = function (key) {
    key = key.toString();
    return this.items.get(key);
};

Cache.prototype.add = function (key, responsePromise) {
    key = key.toString();
    if (typeof responsePromise === "undefined") {
        responsePromise = new ResponsePromise(new Request({
            url: key
        }));
    } else if (!(responsePromise instanceof Promise)) {
        responsePromise = Promise.resolve(responsePromise);
    }

    // Tweak the response with cache headers
    var cachableResponsePromise = responsePromise.then(function (response) {
        response.headers['X-Service-Worker-Cache-Hit'] = true;
        response.headers['X-Service-Worker-Cache-Key'] = key;
        return response;
    }.bind(this));

    return this.items.set(key, cachableResponsePromise).then(function (response) {
        console.log('cache set', response);
    });
};