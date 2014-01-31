var port = chrome.runtime.connect({ name: 'serviceworker-cs' });

document.addEventListener('serviceworker', function (event) {
    try {
        var data = event.detail;
        port.postMessage(data);
    } catch (e) {
        console.error(e);
    }
});

// In-page pollyfill
// This is converted to a string and executed in the
// context of the page. It never runs in this context.
function polyfill() {
    if ('serviceWorker' in window.navigator) return;

    /**
     * Web socket connection
     * This allows the browser-side API to communicate
     * with the node serviceworker implementation.
     */
    var ws;
    var wsQueue = [];

    function connect(tryReconnect) {
        ws = new WebSocket('ws://localhost:5678');
        ws.addEventListener('open', function () {
            tryReconnect = true;
            wsFlushQueue();
        });
        ws.addEventListener('message', function (event) {
            console.log.apply(console, ['ws:'].concat(arguments));
            var data = JSON.parse(event.data);
            if (data.type === "postMessage") {
                // TODO this even needs an origin.
                // https://developer.mozilla.org/en-US/docs/Web/API/MessageEvent
                var newEvent = new Event('message');
                newEvent.data = data.data;
                window.dispatchEvent(newEvent);
                return;
            }
        });
        ws.addEventListener('close', function () {
            ws = null;
            if (tryReconnect) reconnect();
        });
        ws.addEventListener('error', function (e) {
            ws = null;
            if (tryReconnect) reconnect();
        });
    }

    function wsConnected() {
        return (ws && ws.readyState === ws.OPEN);
    }

    function reconnect() {
        connect(false);
        setTimeout(function () {
            if (!wsConnected()) reconnect();
        }, 1000);
    }

    function wsSend(type, data) {
        if (!wsConnected()) {
            // try again later
            wsQueue.push([type, data]);
            return;
        }
        ws.send(JSON.stringify({
            type: type,
            data: data
        }));
    }

    function wsFlushQueue() {
        while (wsConnected() && wsQueue[0]) {
            wsSend.apply(null, wsQueue.shift());
        }
    }

    function callRemote(method /* ... args*/) {
        wsSend(method, {
            args: [].slice.call(arguments, 1)
        });
    }

    connect(true);

    var resolveUrl = (function () {
        var anchor = document.createElement('a');
        return function (url) {
            anchor.href = url;
            return anchor.href;
        };
    }());

    /**
     * API polyfill
     */

    window.navigator.serviceWorker = {
        postMessage: function(msg) {
            callRemote('postMessage', msg, window.location.toString());
        },
        register: function (workerUrl, opts) {
            callRemote('register', window.location.href, resolveUrl(opts.scope), resolveUrl(workerUrl));
        }
    };
}

var script = document.createElement('script');
script.textContent = '(' + polyfill.toString() + ')();';
document.documentElement.appendChild(script);
script.parentNode.removeChild(script);