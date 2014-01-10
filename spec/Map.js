var util = require('util');
var hide = require('hide-key');

module.exports = Map;

function Map() {
    hide(this, '_indexMap', {});
    hide(this, '_list', []);
}

Map.prototype.has = function (key) {
    key = key.toString();
    return this._indexMap.hasOwnProperty(key);
};

Map.prototype.get = function (key) {
    key = key.toString();
    return this._list[this._indexMap[key]];
};

Map.prototype.set = function (key, value) {
    key = key.toString();
    if (this.has(key)) {
        this._list[this._indexMap[key]] = value;
    } else {
        var len = this._list.push(value);
        this._indexMap[key] = len - 1;
    }
    return this;
};

// FIXME: auto generate these

Map.prototype.forEach = function (callback, ctx) {
    var itemMap = this.toObject()
    return this.keys.forEach(function (key) {
        var item = this.get(key);
        return callback.call(ctx || item, item, key, itemMap);
    }.bind(this));
};

Map.prototype.every = function (callback, ctx) {
    var itemMap = this.toObject();
    return this.keys.every(function (key) {
        var item = this.get(key);
        return callback.call(ctx || item, item, key, itemMap);
    }.bind(this));
};

Map.prototype.map = function (callback, ctx) {
    var itemMap = this.toObject();
    return this.keys.map(function (key) {
        var item = this.get(key);
        return callback.call(ctx || item, item, key, itemMap);
    }.bind(this));
};

Map.prototype.toObject = function () {
    return this.keys.reduce(function (memo, key) {
        memo[key] = this.get(key);
        return memo;
    }.bind(this), {});
};

Object.defineProperty(Map.prototype, 'values', {
    get: function () {
        return [].slice.call(this._list);
    }
});

Object.defineProperty(Map.prototype, 'keys', {
    get: function () {
        return Object.keys(this._indexMap);
    }
});

Object.defineProperty(Map.prototype, 'items', {
    get: function () {
        return this.values;
    }
});

Object.defineProperty(Map.prototype, 'size', {
    get: function () {
        return this._list.length;
    }
});