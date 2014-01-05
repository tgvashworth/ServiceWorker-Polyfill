// Worker!

this.version = 1;

var caches = this.caches;
this.addEventListener('install', function (event) {});

this.addEventListener('fetch', function (event) {
    console.log('event.request.url', event.request.url);
});

this.addEventListener('message', function (event) {
    console.log('message event', event);
});