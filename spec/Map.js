var util = require('util');
var hide = require('hide-key');

module.exports = Map;

function Map(iterable) {
    hide(this, '_indexMap', {});
    hide(this, '_list', []);
    if (iterable instanceof Array) {
        iterable.forEach(function (pair) {
            this.set.apply(this, pair);
        }.bind(this));
    }
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

Map.prototype.delete = function (key) {
    key = key.toString();
    if (this.has(key)) {
        this._list.splice(this._indexMap[key], 1);
        delete this._indexMap[key];
    }
    return this;
};

var iterators = ['forEach', 'map', 'reduce', 'every', 'some', 'filter'];
iterators.forEach(function (method) {

    Map.prototype[method] = function (callback) {
        var args = [].slice.call(arguments, 1);
        var self = this;
        args.unshift(function () {
            var innerArgs = [].slice.call(arguments);
            var key = innerArgs[innerArgs.length - 3];
            var item = self.get(key);
            innerArgs[innerArgs.length - 2] = key;
            innerArgs[innerArgs.length - 3] = item;
            return callback.apply(this, innerArgs);
        });
        return this.keys[method].apply(this.keys, args);
    };

});


Map.prototype.toObject = function () {
    return this.reduce(function (memo, value, key) {
        memo[key] = value;
        return memo;
    }, {});
};

Map.prototype.values = function() {
    return [].slice.call(this._list);
};

Map.prototype.items = function() {
    return this.values();
};

Map.prototype.keys = function() {
    return Object.keys(this._indexMap);
};

Object.defineProperty(Map.prototype, 'size', {
    get: function () {
        return this._list.length;
    }
});