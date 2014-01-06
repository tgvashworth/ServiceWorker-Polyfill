var port = chrome.runtime.connect({ name: 'serviceworker-cs' });

document.addEventListener('serviceworker', function (event) {
    console.log('cs event', event);
    try {
        var data = JSON.parse(document.body.dataset[event.timeStamp]);
        console.log('cs data', data);
        port.postMessage(data);
    } catch (e) {
        console.error(e);
    }
});