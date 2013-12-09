this.version = 3;

var caches = this.caches;
this.addEventListener('install', function (e) {
    e.services = ['fetch'];
    var cache = new Cache('assets/shell.3.html', 'assets/app.3.js', 'assets/app.3.css');
    caches.set('app-3', cache);
    e.waitUntil(caches.ready()).then(function () {
        console.log('ServiceWorker ready.');
    });
});

this.addEventListener('fetch', function (event) {
    // Redirect all navigations to the shell page, which can figure out the route
    if (event.type === 'navigate' && event.isTopLevel) {
        console.log('navigation event!');
        return event.respondWith(
            caches.match('assets/shell.3.html')
        );
    }
    // Try to grab the thing from the cache
    event.respondWith(
        fetch(event.request.url)
    );
});