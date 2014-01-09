var strong = document.createElement('strong');
strong.textContent = 'Added from JS!';
document.body.appendChild(strong);

window.addEventListener('load', function () {
    navigator.serviceWorker.postMessage({
        hello: 'world'
    });
});

window.addEventListener('message', function (event) {
    console.log('message', event.data);
});