var util = require('util');
util.inherits(CacheList, Array);

module.exports = CacheList;

function CacheList() {
    Array.apply(this, arguments);
}

CacheList.prototype.match = function () {};

CacheList.prototype.get = function (key) {};

CacheList.prototype.set = function (key, value) {};
