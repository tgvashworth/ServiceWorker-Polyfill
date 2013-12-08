var util = require('util');
var hide = require('./hide');
var instanceOf = require('./instanceOf');
var Promise = require('promise');

module.exports = AsyncMap;

function AsyncMap() {
    hide(this, '_indexMap', {});
    hide(this, '_list', []);
}

AsyncMap.prototype.get = function (key) {
    return this._list[this._indexMap[key]];
};

AsyncMap.prototype.set = function (key, value) {
    var len = this._list.push(value);
    this._indexMap[key] = len - 1;
};

// FIXME: auto generate these

AsyncMap.prototype.forEach = function (callback, ctx) {
    var itemMap = this.toObject()
    return this.keys.forEach(function (key) {
        var item = this.get(key);
        return callback.call(ctx || item, item, key, itemMap);
    }.bind(this));
};

AsyncMap.prototype.every = function (callback, ctx) {
    var itemMap = this.toObject();
    return this.keys.every(function (key) {
        var item = this.get(key);
        return callback.call(ctx || item, item, key, itemMap);
    }.bind(this));
};

AsyncMap.prototype.toObject = function () {
    return this.keys.reduce(function (memo, key) {
        memo[key] = this.get(key);
        return memo;
    }.bind(this), {});
};

Object.defineProperty(AsyncMap.prototype, 'values', {
    get: function () {
        return [].slice.call(this._list);
    }
});

Object.defineProperty(AsyncMap.prototype, 'keys', {
    get: function () {
        return Object.keys(this._indexMap);
    }
});

Object.defineProperty(AsyncMap.prototype, 'items', {
    get: function () {
        return this.values;
    }
});

Object.defineProperty(AsyncMap.prototype, 'size', {
    get: function () {
        return this._list.length;
    }
});