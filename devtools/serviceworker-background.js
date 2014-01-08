// var webRequestTabIds = new Set();

// chrome.runtime.onConnect.addListener(function (port) {
//     if (!port.name.match(/serviceworker/)) return;
//     console.log('connection', port);
//     port.onMessage.addListener(function (msg) {
//         console.log('msg', msg);
//         if (msg.type === 'register') {
//             console.log('adding', port.sender.tab.id);
//             return webRequestTabIds.add(port.sender.tab.id);
//         }
//     });
// });

chrome.webRequest.onBeforeSendHeaders.addListener(
    function addSWHeader(details) {
        details.requestHeaders.push({
            name: 'X-Service-Worker-Request-Type',
            value: (details.type == "main_frame" || details.type == "sub_frame") ? 'navigate' : 'fetch'
        });
        return {
            requestHeaders: details.requestHeaders
        };
    },
    { urls: [ '<all_urls>' ] },
    [ 'blocking', 'requestHeaders' ]
);