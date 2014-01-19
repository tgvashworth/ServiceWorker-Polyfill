var URL = require('dom-urls');
var chalk = require('chalk');

var MessageEvent = require('../spec/MessageEvent');
var fetch = require('../spec/fetch');
var _Worker = require('../lib/_Worker');

module.exports = _WorkerRegistration;

function _WorkerRegistration(url, glob) {
    this.url = new URL(url);
    this.glob = new URL(glob);

    // instances of _Worker
    this.nextWorker = null;
    this.activeWorker = null;
}

_WorkerRegistration.prototype.update = function() {
    var workerRegistration = this;
    
    console.log(chalk.blue('Fetching worker from', this.url.toString()));

    // TODO: we have a race condition here
    // update() should abort any current update request
    return fetch(this.url).then(function(response) {
        var body = response.body.toString();

        if (workerRegistration.activeWorker && workerRegistration.activeWorker.body == body) {
            console.log(chalk.blue('Ignoring fetched worker – identical to active worker'));
            return;
        }

        if (workerRegistration.nextWorker && workerRegistration.nextWorker.body == body) {
            console.log(chalk.blue('Ignoring fetched worker – identical to installing worker'));
            return;
        }

        var nextWorker = new _Worker(workerRegistration.url, body);

        workerRegistration.nextWorker = nextWorker;

        nextWorker.on('replaceCalled', function() {
            if (nextWorker != workerRegistration.nextWorker) {
                // too late!
                console.log('Call to replace() ignored, worker not next in line');
                return;
            }
            workerRegistration.promoteNextWorker();
        });

        // we don't return this promise, registration/update succeeds as soon as install
        // is dispatched, not when install completes
        workerRegistration.nextWorker.install();
    }, function() {
        // TODO:
        // If network failure, fail silently
        // If off-domain redirect, fail silently
        // If 404 ??? - either fail silenty or treat as unregister
        // If != 200, fail silently
        console.log(chalk.blue('Failed to fetch worker during update attempt'));
    });
};

_WorkerRegistration.prototype.promoteNextWorker = function () {
    this.nextWorker.activate();
    this.activeWorker = this.nextWorker;
    this.nextWorker = null;
};