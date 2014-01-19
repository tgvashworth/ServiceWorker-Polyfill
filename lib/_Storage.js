require('es6-shim');
var fs = require('fs');
var pathlib = require('path');
var crypto = require('crypto')
var Promise = require('rsvp').Promise;

module.exports = _Storage;

_Storage.cache = {};

_Storage.heapPrefix = 'heap' + String.fromCharCode(0);

/**
 * Generate a heap id. Just a sha of the hrtime.
 */
_Storage.id = function () {
    var tuple = process.hrtime();
    var time = tuple[0] * 1e9 + tuple[1];
    var shasum = crypto.createHash('sha1');
    shasum.update(''+time);
    return shasum.digest('hex');
};

/**
 * _Storage
 * Promise-y persistence layer.
 * Note: non-heap objects cannot reference each other.
 * TODO: save to files. Currently it persists via the cache above.
 */

function _Storage(namespace) {
    this.heap = !namespace;
    this.namespace = namespace || _Storage.id();
    this.readyPromise = Promise.resolve();
    if (this.heap) {
        _Storage.cache[this.reference({ _storage: this })] = this;
    }
}

/**
 * Setup storage with some default data.
 * TODO: This should ignore the defaults if it can retrieve itself from storage.
 */
_Storage.prototype.init = function(data) {
    this.readyPromise = Promise.resolve(data);
    return this.readyPromise;
};

/**
 * Saves passed state to disk, and resets the ready promise to match.
 * TODO: obviously, doesn't persist
 */
_Storage.prototype.persist = function (data) {
    this.readyPromise = Promise.resolve(data);
    return this.readyPromise;
};

/**
 * Produce a heap reference for an object, if possible.
 */
_Storage.prototype.reference = function (storedObject) {
    if (!storedObject._storage || !storedObject._storage.heap) {
        return storedObject;
    }
    return _Storage.heapPrefix + storedObject._storage.namespace;
};

/**
 * Retrieve some data from the heap using a heap reference
 */
_Storage.prototype.dereference = function (storedObjectReference) {
    // TODO: guard this better
    if (!storedObjectReference.startsWith(_Storage.heapPrefix)) {
        throw Error('Reference is not valid: ' + storedObjectReference)
    }
    // TODO: get from storage
    if (_Storage.cache[namespace]) {
        return Promise.resolve(_Storage.cache[namespace]);
    } else {
        return Promise.reject(new Error('NullPointerException: could not find that thing.'));
    }
};
