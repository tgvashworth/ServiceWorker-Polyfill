var connecter = function (window) {
    var ws;
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
            if (!ws) reconnect();
        }, 1000);
    }

    window.addEventListener('beforeunload', function (e) {
        if (!ws || ws.readyState !== ws.OPEN) return;
        ws.send(JSON.stringify({
            type: 'navigate'
        }));
    });

    connect(true);
}

function inject() {
    chrome.devtools.inspectedWindow.eval(
        '(' + connecter.toString() + ')(window)',
        function () {}
    );
}

chrome.devtools.network.onNavigated.addListener(function () {
    inject();
});

inject();




