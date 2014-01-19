/**
 * serviceworker-demo
 */

var WebSocketServer = require('ws').Server;
var chalk = require('chalk');
var httpProxy = require('http-proxy');
var Promise = require('rsvp').Promise;
var URL = require('dom-urls');

var _WorkerRegistry = require('./lib/_WorkerRegistry');
var Request = require('./spec/Request');

/**
 * Worker data
 */

var workerRegistry = new _WorkerRegistry();

/** ================================================================================================
 * Go, go, go.
 =============================================================================================== **/

module.exports.startServer = startServer;

function startServer(port) {
    // Proxy server
    var server = httpProxy.createServer(handleRequest).listen(port);

    // WebSocket server. The WebSocket is added to pages by the extension.
    var wss = new WebSocketServer({ server: server });
    wss.on('connection', handleWebSocket);
    return Promise.resolve(server);
}

/**
 * Request processors
 */

function handleRequest(_request, _response, proxy) {
    _response.setHeader('X-Proxy', 'ServiceWorker-Polyfill');

    var request = new Request(_request);
    var pageUrl;
    var isNavigate = (request.headers['x-service-worker-request-type'] === 'navigate');

    if (!isNavigate) {
        // No referer header, not much we can do
        if (!request.headers.referer) {
            console.log(chalk.blue('info:'), 'no referer header for', request.url.toString());
            return passThroughRequest(_request, _response, proxy);
        }
        pageUrl = new URL(request.headers.referer);
    }
    else {
        pageUrl = request.url;
    }

    var registration = workerRegistry.getRegistrationFromUrl(pageUrl);

    // TODO: this is non-standard behaviour, change this.
    // Currently any fully installed nextWorker is being
    // activated, as if it called replace().
    if (registration && registration.nextWorker && registration.nextWorker.isInstalled) {
        registration.promoteNextWorker();
    }

    // Nothing matched against this URL, so pass-through
    if (!registration || !registration.activeWorker) {
        _response.setHeader('X-Worker', 'none');
        return passThroughRequest(_request, _response, proxy);
    }

    return registration.activeWorker.handleRequest(request, _response).then(function() {
        // update the controller on navigate
        if (isNavigate) {
            return registration.update();
        }
    }).catch(function(err) {
        console.error(chalk.red(err.stack));
        throw err;
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

function handleWebSocket(socket) {
    socket.on('message', function (message) {
        var data;
        try {
            data = JSON.parse(message);
        } catch (e) {
            console.error(chalk.red(why.stack));
            return;
        }

        Promise.resolve(data).then(function(data) {
            if (data.type === 'register') {
                return workerRegistry.register.apply(workerRegistry, data.data.args);
            }

            if (data.type === 'postMessage') {
                return workerRegistry.postMessageWorker.apply(workerRegistry, data.data.args);
            }
        }).catch(function(err) {
            console.error(chalk.red(err.stack));
            throw err;
        });
    });
    socket.on('close', function (message) {});
}
