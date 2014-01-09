var _WorkerRegistration = require('../lib/_WorkerRegistration');

module.exports = _WorkerRegistry;

function _WorkerRegistry() {
    this.globToRegistration = {};
}

_WorkerRegistry.prototype.getRegistrationFromUrl = function (url) {
    var matchedGlob = this.findGlobMatchForUrl(url.toString());
    if (!matchedGlob) return null;
    return this.getRegistrationFromGlob(matchedGlob);
};

_WorkerRegistry.prototype.findGlobMatchForUrl = function (url) {
    return _WorkerRegistry.findGlobMatchForUrl(
        Object.keys(this.globToRegistration),
        url.toString()
    );
};

_WorkerRegistry.prototype.getRegistrationFromGlob = function (glob) {
    return this.globToRegistration[glob];
};

_WorkerRegistry.prototype.getOrCreateRegistration = function (workerUrl, glob) {
    if (this.globToRegistration[glob]) {
        return this.globToRegistration[glob];
    }
    var workerRegistration = new _WorkerRegistration(workerUrl, glob);
    this.globToRegistration[glob] = workerRegistration;
    return workerRegistration;
};

/**
 * Static
 */

_WorkerRegistry.findGlobMatchForUrl = function (globs, url) {
    return globs.reduce(function (memo, glob) {
        if (url.indexOf(glob) === 0 && (!memo || glob.length > memo.length)) {
            return glob;
        }
        return memo;
    }, undefined);
};

_WorkerRegistry.identicalWorker = function (workerA, workerB) {
    return (workerA.file === workerB.file);
};