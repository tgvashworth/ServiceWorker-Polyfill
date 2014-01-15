var vm = require('vm');
var util = require('util');
var chalk = require('chalk');
var EventEmitter = require('events').EventEmitter;
var Promise = require('rsvp').Promise;

var _Responder = require('../lib/_Responder');

var ServiceWorker = require('../spec/ServiceWorker');
var createScriptLoader = require('../spec/importScripts');
var InstallEvent = require('../spec/InstallEvent');
var ActivateEvent = require('../spec/ActivateEvent');
var MessageEvent = require('../spec/MessageEvent');
var FetchEvent = require('../spec/FetchEvent');
var Request = require('../spec/Request');

util.inherits(_Worker, EventEmitter);
module.exports = _Worker;

function _Worker(url, body) {
    EventEmitter.call(this);

    var worker = this;
    var loadScripts = createScriptLoader(url);
    var scope = new ServiceWorker(url);

    this.url = url;
    this.body = body;
    this.scope = scope;

    // these promises are resolved in install()
    this.isInstalled = false;
    this._installCalled = false;
    this._installResolver = null;
    this._install = new Promise(function(resolve, reject) {
        worker._installResolver = {
            resolve: resolve,
            reject: reject,
        };
    }).then(function() {
        worker.isInstalled = true;
        console.log(chalk.green('Installed worker version:'), chalk.yellow(worker.scope.version));
    }, function(err) {
        // TODO: ???
        // What do we do if waitUntil rejects?
        console.log(chalk.red('Install failed for worker version:'), chalk.yellow(worker.scope.version));
        throw err;
    });
    
    // these promises are resolved in install()
    this._activateCalled = false;
    this._activateResolver = null;
    this._activate = new Promise(function(resolve, reject) {
        worker._activateResolver = {
            resolve: resolve,
            reject: reject,
        };
    }).then(function() {
        console.log(chalk.green('Activated worker version:'), chalk.yellow(worker.scope.version));
    }, function(err) {
        // TODO: ???
        // What do we do if waitUntil rejects?
        console.log(chalk.green('Activate failed for worker version:'), chalk.yellow(worker.scope.version));
        throw err;
    });

    // The vm stuff involves some hackery
    // http://nodejs.org/api/vm.html#vm_sandboxes
    // This recovers from:
    // a) The lack of prototype use
    // b) The loss of 'this' context
    for (var key in scope) {
        if (scope.hasOwnProperty(key)) continue;

        if (scope[key].bind) {
            scope[key] = scope[key].bind(scope);
        }
        else {
            scope[key] = scope[key];
        }
    }

    scope.importScripts = function() {
        var urls = arguments;

        loadScripts.apply(this, urls).forEach(function(script, i) {
            vm.runInContext(script, worker.context, urls[i]);
        });
    };

    // TODO: run worker execution in a forked node process so it can be killed
    this.context = vm.createContext(scope);
    vm.runInContext(body, this.context, url);
    loadScripts.disable();
}

_Worker.prototype.install = function() {
    var worker = this;

    if (this._installCalled) {
        throw Error("Worker already installing/installed");
    }

    this._installCalled = true;
    console.log("Installing…");

    var installEvent = new InstallEvent(function() {
        worker.emit("replaceCalled");
    });

    this.scope.dispatchEvent(installEvent);
    return installEvent._wait.then(this._installResolver.resolve, this._installResolver.reject);
};

_Worker.prototype.activate = function() {
    var worker = this;

    if (this._activateCalled) {
        throw Error("Worker already active/activating");
    }

    this._activateCalled = true;
    console.log("Activating…");

    // If replace is called after waitUntil in the install event,
    // we should wait for the install to complete before activating
    this._install.then(function() {
        var activateEvent = new ActivateEvent();
        worker.scope.dispatchEvent(activateEvent);
        activateEvent._wait.then(worker._activateResolver.resolve, worker._activateResolver.reject);
    });
};

_Worker.prototype.postMessage = function(msg, documentUrl) {
    var messageEvent = new MessageEvent(msg, documentUrl.protocol + '//' + documentUrl.host);
    this.scope.dispatchEvent(messageEvent);
};

_Worker.prototype.handleRequest = function(request, _response) {
    var worker = this;
    var _responder = new _Responder(request, _response);
    var fetchEvent = new FetchEvent(request.headers['x-service-worker-request-type'], request);

    console.log(chalk.yellow('%s'), request.headers['x-service-worker-request-type'], request.url.toString());

    // worker may still be activating, wait
    return this._activate.then(function() {
        worker.scope.dispatchEvent(fetchEvent);

        // If the worker has not called respondWith, we should go to network.
        if (!fetchEvent._isStopped()) {
            return _responder.respondWithNetwork();
        }

        return fetchEvent._responsePromise.then(function(response) {
            return _responder.respond(response);
        }).catch(function(err) {
            console.error('_responder error');
            throw err;
        });
    });
};
