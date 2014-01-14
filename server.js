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
    // Ignore requests without the X-For-Service-Worker header
    // if (typeof _request.headers['x-for-service-worker'] === 'undefined') {
    //     return passThroughRequest(_request, _response, proxy);
    // }

    // This may go to the network, so delete the ServiceWorker header
    // delete _request.headers['x-for-service-worker'];
    _response.setHeader('x-meddled-with', true);

    var request = new Request(_request);
    var pageUrl;

    if (request.headers['x-service-worker-request-type'] === 'fetch') {
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

    var worker = workerRegistry.getActiveWorkerForUrl(pageUrl);

    // Nothing matched against this URL, so pass-through
    if (!worker) {
        _response.setHeader('x-worker', 'none');
        return passThroughRequest(_request, _response, proxy);
    }

    worker.handleRequest(request, _response);
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
        var data;

        try {
            data = JSON.parse(message);
        } catch (e) {
            console.error(chalk.red(why.stack));
            return;
        }

        if (data.type === 'register') {
            workerRegistry.register.apply(workerRegistry, data.data.args);
            return;
        }
        
        if (data.type === 'postMessage') {
            workerRegistry.postMessageWorker.apply(workerRegistry, data.data.args);
            return;
        }
    });
    socket.on('close', function (message) {});
}
