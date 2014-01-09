var URL = require('dom-urls');

module.exports = _WorkerRegistration;

function _WorkerRegistration(url, glob) {
    this.url = new URL(url);
    this.glob = new URL(glob);
    this.installed = {};
    this.active = {};
}

_WorkerRegistration.prototype.hasActiveWorker = function () {
    return this.active && this.active.worker;
}

_WorkerRegistration.prototype.hasInstalledWorker = function () {
    return this.installed && this.installed.worker;
}

_WorkerRegistration.prototype.activateInstalledWorker = function () {
    this.active = this.installed;
    this.installed = null;
}