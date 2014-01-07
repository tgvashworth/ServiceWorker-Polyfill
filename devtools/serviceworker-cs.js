var port = chrome.runtime.connect({ name: 'serviceworker-cs' });

document.addEventListener('serviceworker', function (event) {
    console.log('cs event', event);
    try {
        var data = event.detail;
        console.log('cs data', data);
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

    function connect(tryReconnect) {
        ws = new WebSocket('ws://localhost:5678');
        ws.addEventListener('open', function () {
            tryReconnect = true;
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
        if (!wsConnected()) return;
        ws.send(JSON.stringify({
            type: type,
            data: data
        }));
    }

    connect(true);

    /**
     * API polyfill
     */
    
    window.navigator.serviceWorker = {
        postMessage: function(msg) {
            wsSend('postMessage', msg);
        }
    };

    window.navigator.registerServiceWorker = function (urlGlob, workerUrl) {
        console.log(arguments);
        // Fire event on the DOM. The CS-side will pick it up and inform the background page.
        var event = new CustomEvent("serviceworker", {
            "detail": {
                type: 'registration',
                args: [].slice.call(arguments)
            }
        });
        document.dispatchEvent(event);
    };
}

var script = document.createElement('script');
script.textContent = '(' + polyfill.toString() + ')();';
document.documentElement.appendChild(script);
script.parentNode.removeChild(script);