/**
 * serviceworker-demo
 */

var http = require('http');
var fs = require('fs');
var falafel = require('falafel');
var WebSocketServer = require('ws').Server;
var urlLib = require('url');
var chalk = require('chalk');
var httpProxy = require('http-proxy');
var astUtils = require('./lib/astUtils');
var vm = require('vm');

/**
  * Internal APIs
  */
var _WorkerRegistry = require('./lib/_WorkerRegistry');
var _WorkerRegistration = require('./lib/_WorkerRegistration');
var _Responder = require('./lib/_Responder');
var _ProxyRequest = require('./lib/_ProxyRequest');

/**
 * DOM APIs
 * These are (mostly) passed to the worker on execution
 */
var ServiceWorker = require('./spec/ServiceWorker');

var Promise = require('rsvp').Promise;

var URL = require('dom-urls');

var fetch = require('./spec/fetch');
var importScripts = require('./spec/importScripts');

var ResponsePromise = require('./spec/ResponsePromise');
var Response = require('./spec/Response');
var SameOriginResponse = require('./spec/SameOriginResponse');
var Request = require('./spec/Request');

var Map = require('./spec/Map');
var AsyncMap = require('./spec/AsyncMap');
var CacheList = require('./spec/CacheList');
var CacheItemList = require('./spec/CacheItemList');
var Cache = require('./spec/Cache');

var Event = require('./spec/Event');
var InstallEvent = require('./spec/InstallEvent');
var FetchEvent = require('./spec/FetchEvent');
var ActivateEvent = require('./spec/ActivateEvent');
var MessageEvent = require('./spec/MessageEvent');

var fakeConsole = Object.getOwnPropertyNames(console).reduce(function (memo, method) {
    memo[method] = console[method];
    if (typeof console[method] === "function") {
        memo[method] = memo[method].bind(console, chalk.blue('sw:'));
    }
    return memo;
}, {});

/**
 * Worker data
 */

var workerRegistry = new _WorkerRegistry();

/** ================================================================================================
 * Go, go, go.
 =============================================================================================== **/

module.exports.startServer = startServer;
function startServer(port) {
    return Promise.resolve().then(function () {
        // Proxy server
        var server = httpProxy.createServer(handleRequest).listen(port);

        // WebSocket server. The WebSocket is added to pages by the extension.
        var wss = new WebSocketServer({ server: server });
        wss.on('connection', handleWebSocket);
        return server;
    });
}

/**
 * Request processors
 */

function handleRequest(_request, _response, proxy) {
    // Ignore requests without the X-For-Service-Worker header
    // if (typeof _request.headers['x-for-service-worker'] === 'undefined') {
    //     return passThroughRequest(_request, _response, proxy);
    // }

    // This may go to the network, so delete the ServiceWorker header
    // delete _request.headers['x-for-service-worker'];
    _response.setHeader('x-meddled-with', true);

    var request = new Request(_request);

    var urlToMatch = request.url;
    if (request.headers['x-service-worker-request-type'] === 'fetch') {
        // No referer header, not much we can do
        if (!request.headers.referer) {
            console.log(chalk.blue('info:'), 'no referer header for', request.url.toString());
            return passThroughRequest(_request, _response, proxy);
        }
        urlToMatch = new URL(request.headers.referer);
    }

    // Find glob for URL
    var matchedGlob = workerRegistry.findGlobMatchForUrl(urlToMatch);

    // Nothing matched against this URL, so pass-through
    if (!matchedGlob) {
        _response.setHeader('x-glob-match', 'none');
        return passThroughRequest(_request, _response, proxy);
    }

    // Get the worker state for this glob
    var workerRegistration = workerRegistry.getRegistrationFromUrl(urlToMatch);

    // A glob matched, but no registration was found. wat.
    if (!workerRegistration) {
        _response.setHeader('x-worker-registration', 'none');
        _response.setHeader('x-wat', 'indeed');
        return passThroughRequest(_request, _response, proxy);
    }

    console.log(chalk.yellow('%s'), _request.headers['x-service-worker-request-type'], request.url.toString());

    var _responder = new _Responder(request, _response);
    var fetchEvent = new FetchEvent(_request.headers['x-service-worker-request-type'], request, _responder);

    var readyPromise = Promise.resolve();

    // If we have an installed worker waiting, activate it
    if (workerRegistration.hasInstalledWorker()) {
        console.log('activating worker');
        readyPromise = activateWorker(workerRegistration.installed.worker)
            .then(workerRegistration.activateInstalledWorker.bind(workerRegistration));
    }

    // We should now have an installed and active worker.
    readyPromise
        .then(function () {
            workerRegistration.active.worker.dispatchEvent(fetchEvent);
            // If the worker has not called respondWith, we should go to network.
            if (!fetchEvent._isStopped()) {
                _responder.respondWithNetwork().catch(logError);
            }
        })
        .catch(logError)
}

function passThroughRequest(_request, _response, proxy) {
    var buffer = httpProxy.buffer(_request);
    return proxy.proxyRequest(_request, _response, {
        host: _request.headers.host.split(':')[0],
        port: parseInt(_request.headers.host.split(':')[1], 10) || 80,
        buffer: buffer
    });
}

function handleWebSocket(socket) {
    // Listen up!
    socket.on('message', function (message) {
        // TODO guard this
        try {
            var data = JSON.parse(message);
        } catch (e) {
            return logError(e);
        }

        if (data.type === 'register') {
            registerServiceWorker.apply(null, data.data.args);
        }

        if (data.type === 'postMessage') {
            return workerRegistry.postMessageWorker.apply(workerRegistry, data.data.args);
        }
    });
    socket.on('close', function (message) {});
}

/**
 * Utils
 */

/**
 * Handles navigator.registerServiceWorker(...)
 */
function registerServiceWorker(origin, glob, rawGlob, workerUrl) {
    // Trailing stars are pointless
    glob = glob.replace(/\*$/, '');

    origin = new URL(origin);
    glob = new URL(glob);
    workerUrl = new URL(workerUrl);

    // Don't allow workers to register for cross-protocol globs
    if (glob.protocol !== origin.protocol) {
        console.log(chalk.red('Registration rejected: glob and origin protocols do not match.'));
        return Promise.reject();
    }

    // Don't allow cross-protocol workers
    if (origin.protocol !== workerUrl.protocol) {
        console.log(chalk.red('Registration rejected: worker and origin protocols do not match.'));
        return Promise.reject();
    }

    // Don't allow workers to register for origins they don't own
    if (glob.host.indexOf(origin.host) !== 0) {
        console.log(chalk.red('Registration rejected: worker trying to register for an origin it does not own.'));
        console.log('%s for origin %s', glob.toString(), origin.toString());
        return Promise.reject();
    }

    // Don't allow cross-origin workers
    if (origin.host.indexOf(workerUrl.host) !== 0) {
        console.log(chalk.red('Registration rejected: cross-origin worker not allowed.'));
        console.log('%s for origin %s', glob.toString(), origin.toString());
        return Promise.reject();
    }

    console.log(chalk.green('Registering: ') + '%s for %s.', workerUrl.toString(), glob.toString());

    return loadWorker(workerUrl)
        // Compare the worker file to the existing, loaded workers
        .then(function (workerFile) {
            var workerRegistration = workerRegistry.getRegistrationFromUrl(workerUrl);

            if (workerRegistration) {
                // Identical to installed worker?
                if (workerRegistration.hasInstalledWorker() &&
                    _WorkerRegistry.identicalWorker(workerRegistration.installed, workerFile)) {
                    console.log(chalk.red('Ignoring new worker – identical to installed worker.'));
                    return Promise.reject();
                }

                // Identical to active worker?
                if (workerRegistration.hasActiveWorker &&
                    _WorkerRegistry.identicalWorker(workerRegistration.active, workerFile)) {
                    console.log(chalk.red('Ignoring new worker – identical to active worker.'));
                    return Promise.reject();
                }
            }

            // We're all good, so setup (execute) the worker
            return setupWorker(workerFile, workerUrl, glob, rawGlob, origin);
        })
        // We have an executed worker, so now install it
        .then(function (workerData) {
            var workerRegistration = workerRegistry.getOrCreateRegistration(workerUrl, glob);
            return installWorker(workerData.worker).then(function () {
                workerRegistration.installed = workerData;
                return workerRegistration;
            });
        })
        .catch(logError);
}

/**
 * Load the worker file across the network
 */
function loadWorker(workerUrl) {
    // Load and compare worker files
    return fetch(workerUrl).then(function (response) {
        return response.body.toString();
    });
}

/**
 * Eval the worker in a new ServiceWorker context with all the trimmings, via new Function.
 */
function setupWorker(workerFile, workerUrl, glob, rawGlob, origin) {
    var worker = new ServiceWorker(workerUrl, glob, rawGlob, origin);
    var importer = importScripts(workerUrl);
    var expandedWorkerBody = expandWorkerFile(workerFile);

    // The vm stuff involves some hackery
    // http://nodejs.org/api/vm.html#vm_sandboxes
    // This recovers from:
    // a) The lack of prototype use
    // b) The loss of 'this' context
    for (var key in worker) {
        if (worker.hasOwnProperty(key)) continue;

        if (worker[key].bind) {
            worker[key] = worker[key].bind(worker);
        }
        else {
            worker[key] = worker[key];
        }
    }

    vm.runInNewContext(expandedWorkerBody, worker, workerUrl);

    // Now the worker has been setup. Don't allow importScripts to be called again.
    worker.importScripts.disable();

    return {
        worker: worker,
        file: workerFile
    };
}

function expandWorkerFile(workerBody) {
    var expandedWorkerBody = falafel(workerBody, function(node) {
        if (astUtils.isCallTo(node, 'importScripts')) {
            // TODO: Ensure this is only called in initial execution context, ie. not in event handler.
            node.update('eval(' + node.source() + ')');
        }
    });
    return expandedWorkerBody;
}

/**
 * Install the worker by firing an InstallEvent on it. The event constructor is passed the callbacks
 * for the promise so it can resolve or reject it.
 *
 * TODO: can this fulfillment pattern be abstracted?
         answer: yes, make the promise inside PromiseEvent and add methods
         to force resolve/reject. Or something.
 */
function installWorker(worker) {
    console.log('Installing...');
    var installPromise = new Promise(function (resolve, reject) {
        // Install it!
        var installEvent = new InstallEvent(resolve, reject);
        worker.dispatchEvent(installEvent);
        // If waitUntil was not called, we can assume things went swell.
        // TODO should we prevent waitUtil being called now?
        if (!installEvent._isStopped()) {
            return resolve();
        }
    });
    // How'd we do?
    installPromise.then(function () {
        console.log(chalk.green('Installed worker version:'), chalk.yellow(worker.version));
    }, function () {
        console.log(chalk.red('Install failed for worker version:'), chalk.yellow(worker.version));
    });
    return installPromise;
}

/**
 * Activate the worker.
 * This occurs at the time of the first navigation after the worker was installed.
 * TODO this function and the install are very similar. Can they be abstracted?
 */
function activateWorker(worker) {
    console.log('Activating...');
    var activatePromise = new Promise(function (resolve, reject) {
        // Activate it
        var activateEvent = new ActivateEvent(resolve, reject);
        worker.dispatchEvent(activateEvent);
        if (!activateEvent._isStopped()) {
            return resolve();
        }
    });
    // How'd we do?
    activatePromise.then(function () {
        console.log(chalk.green('Activated worker version:'), chalk.yellow(worker.version));
    }, function () {
        console.log(chalk.red('Activation failed for worker version:'), chalk.yellow(worker.version));
    });
    return activatePromise;
}

/**
 * Error handler
 */
function logError(why) {
    console.error(chalk.red(why.stack));
}