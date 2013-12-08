var hide = require('./hide');
var Promise = require('promise');
var Request = require('./Request');
var ResponsePromise = require('./ResponsePromise');

module.exports = Cache;

function Cache() {
    this.items = [];

    var urls = [].slice.call(arguments);
    var requests = urls.map(function (url) {
        return new Request({
            url: url
        });
    });
    var reponsePromises = requests.map(function (request) {
        return new ResponsePromise(request);
    });

    var cacheReadyPromise = Promise.all(reponsePromises).then(function (responses) {
        this.items = responses;
    }.bind(this));
    hide(this, 'cacheReadyPromise', cacheReadyPromise);
}

Cache.prototype.ready = function () {
    return this.cacheReadyPromise;
};