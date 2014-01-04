/**
 * NB: run in the context of the inspected page. Does not have this scope!
 */
function addServiceWorker(window) {
    // Create a custom console with a useful prefix
    var console = {}
    for(var method in window.console){
        console[method] = window.console[method];
        if (typeof window.console[method] === "function") {
            console[method] = console[method].bind(window.console, 'serviceworker-devtools:');
        }
    }

    // Don't inject twice
    if (navigator._serviceWorker) return console.log('Already injected');
    Object.defineProperty(navigator, '_serviceWorker', {
        value: true
    });

    var ws;

    /**
     * ServiceWorker
     * Swaps in required methods
     */

    function loaded() {
        if (!('serviceWorker' in window.navigator)) throw Error('No ServiceWorker API found.');

        navigator.serviceWorker.postMessage.swap(function (msg) {
            wsSend('postMessage', msg);
        });

    }

    /**
     * Connection
     */

    function connect(tryReconnect) {
        ws = new WebSocket('ws://localhost:5678');
        ws.addEventListener('open', function () {
            tryReconnect = true;
        });
        ws.addEventListener('message', function () {
            console.log.apply(console, ['ws:'].concat(arguments));
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

    function reconnect() {
        connect(false);
        setTimeout(function () {
            if (!wsConnected()) reconnect();
        }, 1000);
    }

    /**
     * Navigation
     */

    window.addEventListener('beforeunload', function (e) {
        wsSend('navigate');
    });

    /**
     * Utils
     */

    function wsConnected() {
        return (ws && ws.readyState === ws.OPEN);
    }

    function wsSend(type, data) {
        if (!wsConnected()) return;
        ws.send(JSON.stringify({
            type: type,
            data: data
        }));
    }

    /**
     * Go, go, go!
     */

    connect(true);
    window.addEventListener('load', loaded);
}

function thrower(error) {
    console.error('serviceworker-devtools:', error.value);
}

function evaler(fn, arg, cb, wasError) {
    chrome.devtools.inspectedWindow.eval(
        '(' + fn.toString() + ')(' + arg + ')',
        function (result, error) {
            if (!wasError && error && error.isException) {
                evaler(thrower, JSON.stringify({ value: error.value }), null, true);
            }
            cb && cb.apply(this, arguments);
        }
    );
}

function inject() {
    evaler(addServiceWorker, 'window');
}

chrome.devtools.network.onNavigated.addListener(function () {
    inject();
});

inject();