// Worker!

this.version = 1;

var caches = this.caches;
this.addEventListener('install', function (event) {
    var cache = new Cache(
        new URL('assets/app.3.js', 'http://demosite.dev')
    );
    caches.set('cache', cache);
    event.waitUntil(
        caches.ready()
    );
});

this.addEventListener('fetch', function (event) {
    console.log('event.request.url', event.request.url.toString());
    event.respondWith(
        caches.match(event.request.url).then(null, function () {
            return fetch(event.request.url);
        })
    );
});

this.addEventListener('message', function (event) {
    console.log('message event', event);
});