var webRequestTabIds = new Set();

chrome.runtime.onConnect.addListener(function (port) {
    if (!port.name.match(/serviceworker/)) return;
    console.log('connection', port);
    port.onMessage.addListener(function (msg) {
        console.log('msg', msg);
        if (msg.type === 'registration') {
            console.log('adding', port.sender.tab.id);
            return webRequestTabIds.add(port.sender.tab.id);
        }
    });
});

chrome.webRequest.onBeforeSendHeaders.addListener(
    function addSWHeader(details) {
        if (webRequestTabIds.has(details.tabId)) {
            // Notify the SW server that this request should be handled
            // console.log('modifying request', details);
            details.requestHeaders.push({
                name: 'X-For-Service-Worker',
                value: '1'
            });
        }
        return {
            requestHeaders: details.requestHeaders
        };
    },
    { urls: [ '<all_urls>' ] },
    [ 'blocking', 'requestHeaders' ]
);