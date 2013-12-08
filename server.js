var http = require('http');
var fs = require('fs');

// Internal APIs
var _Responder = require('./_Responder');

// DOM APIs
var ServiceWorker = require('./ServiceWorker');
var CacheList = require('./CacheList');
var Cache = require('./Cache');

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
    'CacheList', 'Cache',
    'Event', 'InstallEvent', 'FetchEvent',
    'Response', 'SameOriginResponse',
    'Request',
    workerFile
);
workerFn.call(
    worker,
    CacheList, Cache,
    Event, InstallEvent, FetchEvent,
    Response, SameOriginResponse,
    Request
);

// Install it
var installEvent = new InstallEvent();
worker.dispatchEvent(installEvent);
console.log('ServiceWorker registered for %s events', installEvent.services.join(' & '));

http.createServer(function (_request, _response) {
    var request = new Request(_request);
    var _responder = new _Responder(_request, _response);
    var fetchEvent = new FetchEvent(request, _responder);
    worker.dispatchEvent(fetchEvent);
    if (!fetchEvent.immediatePropagationStopped &&
        !fetchEvent.propagationStopped &&
        !fetchEvent.defaultPrevented) {
        _responder.respondWithNetwork().then(null, function (why) {
            console.error(why);
        });
    }
}).listen(process.argv[2]);