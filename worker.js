this.version = 10;

var caches = this.caches;
this.addEventListener('install', function (e) {
    e.services = ['fetch'];
    var cache = new Cache('/assets/shell.3.html', '/assets/app.3.css', '/assets/app.3.js');
    caches.set('app', cache);
    e.waitUntil(caches.ready()).then(function () {
        console.log();
        console.log('ServiceWorker ready.');
        console.log();
    });
});

this.addEventListener('fetch', function (event) {
    console.log(event.type, event.request.url);
    // Redirect all navigations to the shell page, which can figure out the route
    if (event.type === "navigate" && event.isTopLevel) {
        return event.respondWith(
            caches.match('/assets/shell.3.html')
        );
    }
    // Try to grab the thing from the cache
    event.respondWith(
        caches.match(event.request.url).then(function (response) {
            console.log('cache hit', event.request.url, response);
            return response;
        }, function (why) {
            console.log('cache miss', event.request.url);
            throw why;
        })
    );
});

this.addEventListener('activate', function (event) {});
