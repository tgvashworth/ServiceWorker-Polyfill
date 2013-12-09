this.version = 4;

var caches = this.caches;
this.addEventListener('install', function (e) {
    e.services = ['fetch'];
    var cache = new Cache('assets/shell.3.html');
    caches.set('app-4', cache);
    e.waitUntil(
        caches.ready().then(null, function (why) {
            console.log('caches ready error', why);
        })
    ).then(function () {
        console.log('ServiceWorker ready.');
        console.log('caches', caches);
    });
});

this.addEventListener('fetch', function (event) {
    console.log('fetch');
    // Redirect all navigations to the shell page, which can figure out the route
    if (event.type === 'navigate' && event.isTopLevel) {
        return event.respondWith(
            caches.match('assets/shell.3.html').then(null, function (why) {
                console.error('match error', why);
                throw why;
            })
        ).then(null, function (why) {
            console.error('respond with error', why);
            throw why;
        });
    }
    // Try to grab the thing from the cache
    event.respondWith(
        caches.match(event.request.url)
    ).then(null, function (why) {
        console.error('respond with error', why);
        throw why;
    }).then(function (response) {
        caches.match(event.request.url).then(null, function () {
            console.log('adding to cache', event.request.url, response);
            caches.get('app-4').add(event.request.url, response);
            console.log('== items ========================');
            caches.get('app-4').items.forEach(function (item, key) {
                console.log(key, item);
                console.log();
            });
            console.log('== /items ========================');
            return response;
        });
        return response;
    }).then(null, function (why) {
        console.error('add to cache error', why);
        throw why;
    })
});