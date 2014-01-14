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

    this.update();
}

_WorkerRegistration.prototype.update = function() {
    var workerRegistration = this;
    
    // TODO: we have a race condition here
    // update() should abort any current update request
    fetch(this.url).then(function(response) {
        var body = response.body.toString();

        if (workerRegistration.activeWorker && workerRegistration.activeWorker.body == body) {
            throw Error('Ignoring new worker – identical to active worker');
        }

        if (workerRegistration.nextWorker && workerRegistration.nextWorker.body == body) {
            throw Error('Ignoring new worker – identical to installing worker');
        }

        var nextWorker = new _Worker(workerRegistration.url, body);

        workerRegistration.nextWorker = nextWorker;

        nextWorker.on('replace', function() {
            if (nextWorker != workerRegistration.nextWorker) {
                // we're late to the party
                console.log('Call to replace() ignored, worker not next in line');
                return;
            }
            workerRegistration.promoteNextWorker();
        });

        workerRegistration.nextWorker.install();
    }, function() {
        // TODO:
        // If network failure, fail silently
        // If off-domain redirect, fail silently
        // If 404 ??? - either fail silenty or treat as unregister
        // If != 200, fail silently
        throw new Error("Ignoring new worker - network error");
    }).catch(function(err) {
        console.log(chalk.red(err.message));
    });
};

_WorkerRegistration.prototype.promoteNextWorker = function () {
    this.nextWorker.activate();
    this.activeWorker = this.nextWorker;
    this.nextWorker = null;
};