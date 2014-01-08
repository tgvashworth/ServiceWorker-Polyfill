/**
 * serviceworker-demo
 */

var http = require('http');
var fs = require('fs');
var WebSocketServer = require('ws').Server;
var urlLib = require('url');
var chalk = require('chalk');
var httpProxy = require('http-proxy');

/**
  * Internal APIs
  */
var _Requester = require('./_Requester');
var _Responder = require('./_Responder');
var _ProxyRequest = require('./_ProxyRequest');
// Messenger is a singleton given to all ServiceWorkers for to postMessage it up.
var _Messenger = require('./_Messenger');
var _messenger = new _Messenger();

/**
 * DOM APIs
 */
var ServiceWorker = require('./ServiceWorker');

var Promise = require('rsvp').Promise;

var URL = require('dom-urls');

var AsyncMap = require('./AsyncMap');
var CacheList = require('./CacheList');
var CacheItemList = require('./CacheItemList');
var Cache = require('./Cache');

var fetch = require('./fetch');

var ResponsePromise = require('./ResponsePromise');
var Response = require('./Response');
var SameOriginResponse = require('./SameOriginResponse');
var Request = require('./Request');

var Event = require('./Event');
var InstallEvent = require('./InstallEvent');
var FetchEvent = require('./FetchEvent');
var ActivateEvent = require('./ActivateEvent');
var MessageEvent = require('./MessageEvent');

var fakeConsole = Object.getOwnPropertyNames(console).reduce(function (memo, method) {
    memo[method] = console[method];
    if (typeof console[method] === "function") {
        memo[method] = memo[method].bind(console, 'sw:');
    }
    return memo;
}, {});

/**
 * Config
 */

/**
 * Worker data
 */

var templateWorkerState = {
    worker: null,
    content: '',
    installing: {},
    active: {}
};

var globToWorkerState = {};

/** ================================================================================================
 * Go, go, go.
 =============================================================================================== **/

module.exports.startServer = startServer;
function startServer(port) {

    /**
      * Proxy server. Pass-through unless X-For-Service-Worker header is present on the request.
      */
    var server = httpProxy.createServer(processRequest).listen(port);

    /**
     * WebSocket comes from devtools extension.
     * It uses beforeunload events to notify the service worker when events
     * are navigations.
     */
    var wss = new WebSocketServer({ server: server });
    // TODO only accept one connection per page
    wss.on('connection', function (ws) {
        _messenger.add(ws);
        // Listen up!
        ws.on('message', function (message) {
            // TODO guard this
            var data = JSON.parse(message);

            if (data.type === 'register') {
                registerServiceWorker.apply(null, data.data.args);
            }

            // if (data.type === 'postMessage') {
            //     console.log('postMessage in:', data.data);
            //     var messageEvent = new MessageEvent(data.data);
            //     // We can only message an activated worker
            //     if (!currentWorkerData.activatePromise) return;
            //     currentWorkerData.activatePromise.then(function () {
            //         currentWorkerData.worker.dispatchEvent(messageEvent);
            //     });
            // }
        });
        ws.on('close', function (message) {
            _messenger.remove(ws);
        });
    });
}

/**
 * Request processors
 */

function processRequest(_request, _response, proxy) {
    // Ignore requests without the X-For-Service-Worker header
    // if (typeof _request.headers['x-for-service-worker'] === 'undefined') {
    //     return passThroughRequest(_request, _response, proxy);
    // }

    // This may go to the network, so delete the ServiceWorker header
    // delete _request.headers['x-for-service-worker'];
    _response.setHeader('x-meddled-with', true);


    /**
     * Find a worker state to process
     */

    // Find glob for URL
    var matchedGlob = findGlobMatchForUrl(Object.keys(globToWorkerState), _request.url);

    // Nothing matched against this URL, so pass-through
    if (!matchedGlob) {
        _response.setHeader('x-glob-match', 'none');
        return passThroughRequest(_request, _response, proxy);
    }

    // Get the worker state for this glob
    var workerState = globToWorkerState[matchedGlob];

    var request = new Request(_request);
    console.log(_request.headers['x-service-worker-request-type'], request.url.toString());

    var _responder = new _Responder(request, _response);
    var fetchEvent = new FetchEvent(_request.headers['x-service-worker-request-type'], request, _responder);

    var readyPromise = Promise.resolve();

    // If we have an installed worker waiting, activate it
    if (hasInstalledWorker(workerState)) {
        readyPromise = activateWorker(workerState.installed.worker).then(function () {
            swapWorkers(workerState);
        });
    }

    // We should now have an installed and active worker.
    readyPromise.then(function () {
        workerState.active.worker.dispatchEvent(fetchEvent);
        // If the worker has not called respondWith, we should go to network.
        if (!fetchEvent._isStopped()) {
            _responder.respondWithNetwork().catch(logError);
        }
    });
}

function passThroughRequest(_request, _response, proxy) {
    var buffer = httpProxy.buffer(_request);
    return proxy.proxyRequest(_request, _response, {
        host: _request.headers.host.split(':')[0],
        port: parseInt(_request.headers.host.split(':')[1], 10) || 80,
        buffer: buffer
    });
}

/**
 * Utils
 */

function findGlobMatchForUrl(globs, url) {
    return globs.reduce(function (memo, glob) {
        if (url.indexOf(glob) === 0 && (!memo || glob.length > memo.length)) {
            return glob;
        }
        return memo;
    }, undefined);
}

function getWorkerState(glob) {
    return globToWorkerState[glob] ||
                (globToWorkerState[glob] = Object.create(templateWorkerState));
}

function identicalWorker(workerA, workerB) {
    return (workerA.file === workerB.file);
}

function hasActiveWorker(workerState) {
    return workerState.active && workerState.active.worker;
}

function hasInstalledWorker(workerState) {
    return workerState.installed && workerState.installed.worker;
}

function registerServiceWorker(origin, glob, workerUrl) {
    // Trailing stars are pointless
    glob = glob.replace(/\*$/, '');

    origin = new URL(origin);
    glob = new URL(glob);
    workerUrl = new URL(workerUrl);

    // Don't allow workers to register for origins they don't own
    if (glob.toString().indexOf(origin.toString()) !== 0) {
        console.log(chalk.red('Cross-origin registration rejected'));
        console.log('%s for origin %s', glob.toString(), origin.toString());
        return;
    }

    console.log(chalk.green('Registering: ') + '%s for %s.', workerUrl.toString(), glob.toString());

    // Load, install
    loadWorker(workerUrl)
        .then(function (workerData) {
            var workerState = getWorkerState(glob);

            // Identical to installed worker?
            if (hasInstalledWorker(workerState) &&
                identicalWorker(workerState.installed, workerData)) {
                return console.log('Ignoring – identical to installed worker.');
            }

            // Identical to active worker?
            if (hasActiveWorker(workerState) &&
                identicalWorker(workerState.active, workerData)) {
                return console.log('Ignoring – identical to active worker.');
            }

            return installWorker(workerData.worker).then(function () {
                workerState.installed = workerData;
            });
        })
        .catch(logError);
}

/**
 * Load the worker file, and figure out if loading a new worker is necessary.
 * If it is, set is up and install it.
 */
function loadWorker(workerUrl) {
    // Load and compare worker files
    return new ResponsePromise({ url: workerUrl }).then(function (response) {
        var workerFile = response.body.toString();
        return setupWorker(workerFile);
    });
}

/**
 * Eval the worker in a new ServiceWorker context with all the trimmings, via new Function.
 */
function setupWorker(workerFile) {
    var worker = new ServiceWorker(_messenger);
    var workerFn = new Function(
        // Argument names
        'AsyncMap', 'CacheList', 'CacheItemList', 'Cache',
        'Event', 'InstallEvent', 'ActivateEvent', 'FetchEvent', 'MessageEvent',
        'Response', 'SameOriginResponse',
        'Request',
        'fetch', 'URL',
        'Promise',
        'console', // teehee
        // Function body
        workerFile
    );
    workerFn.call(
        // this
        worker,
        // Arguments
        AsyncMap, CacheList, CacheItemList, Cache,
        Event, InstallEvent, ActivateEvent, FetchEvent, MessageEvent,
        Response, SameOriginResponse,
        Request,
        fetch, URL,
        Promise,
        fakeConsole
    );
    return {
        worker: worker,
        file: workerFile
    };
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

function swapWorkers(workerState) {
    workerState.active = workerState.installed;
    workerState.installed = null;
}

/**
 * Error handler
 */
function logError(why) {
    console.error(chalk.red(why.stack));
}