var URL = require('dom-urls');
var MessageEvent = require('../spec/MessageEvent');

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

_WorkerRegistration.prototype.postMessageWorker = function (msg, documentUrl) {
    if (!this.hasActiveWorker()) {
        return console.log('No active worker for the postMessage.');
    }
    // Fake the origin. TODO this should be better
    var messageEvent = new MessageEvent(msg, documentUrl.protocol + '//' + documentUrl.host);
    this.active.worker.dispatchEvent(messageEvent);
}