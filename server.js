var http = require('http');
var fs = require('fs');
var WebSocketServer = require('ws').Server;

// Internal APIs
var _Responder = require('./_Responder');
var _ProxyRequest = require('./_ProxyRequest');

// DOM APIs
var ServiceWorker = require('./ServiceWorker');

var AsyncMap = require('./AsyncMap');
var CacheList = require('./CacheList');
var CacheItemList = require('./CacheItemList');
var Cache = require('./Cache');

var fetch = require('./fetch');

var Response = require('./Response');
var SameOriginResponse = require('./SameOriginResponse');
var Request = require('./Request');

var Event = require('./Event');
var InstallEvent = require('./InstallEvent');
var FetchEvent = require('./FetchEvent');

// Create worker
var workerFile = fs.readFileSync(process.argv[3], { encoding: 'utf-8' });
var worker = new ServiceWorker();
var workerFn = new Function(
    'AsyncMap', 'CacheList', 'CacheItemList', 'Cache',
    'Event', 'InstallEvent', 'FetchEvent',
    'Response', 'SameOriginResponse',
    'Request',
    'fetch',
    workerFile
);
workerFn.call(
    worker,
    AsyncMap, CacheList, CacheItemList, Cache,
    Event, InstallEvent, FetchEvent,
    Response, SameOriginResponse,
    Request,
    fetch
);

// Install it
var installEvent = new InstallEvent();
installEvent._install().then(function () {
    worker._isInstalled = true;
});
worker.dispatchEvent(installEvent);
console.log('ServiceWorker registered for %s events', installEvent.services.join(' & '));

// Hacky, hacky, hacky :)
var requestIsNavigate = false;

// Create the server (proxy-ish)
var server = http.createServer(function (_request, _response) {
    console.log('== REQUEST ========================================== !! ====');
    console.log(_request.url);
    console.log('===================================================== !! ====');
    var request = new _ProxyRequest(_request);
    var _responder = new _Responder(_request, _response, requestIsNavigate);
    var fetchEvent = new FetchEvent(request, _responder);
    requestIsNavigate = false;
    if (worker._isInstalled) {
        worker.dispatchEvent(fetchEvent);
    }
    if (!fetchEvent.immediatePropagationStopped &&
        !fetchEvent.propagationStopped &&
        !fetchEvent.defaultPrevented) {
        _responder.respondWithNetwork().then(null, function (why) {
            console.error(why);
        });
    }
}).listen(process.argv[2]);

var wss = new WebSocketServer({ server: server });
wss.on('connection', function (ws) {
    console.log('ws connection');
    ws.on('message', function (message) {
        var data = JSON.parse(message);
        console.log('ws message', message);
        if (data.type === 'navigate') {
            requestIsNavigate = true;
        }
    });
});