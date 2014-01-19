// Worker!

this.version = 3;

// Import a script to use in the worker.
importScripts('http://workerdemo.dev/resources.js');
console.log('resources', resources);

var caches = this.caches;

/**
 * The worker is installed before anything else. Cache setup should happed here.
 */
this.addEventListener('install', function (event) {
    // Cache the JS file and the twitter image (cross-domain, yo!)
    var cache = new Cache();
    // resources comes from the imported script. Add all of them to the cache.
    resources.forEach(function (url) {
        cache.add(new URL(url));
    });
    // Add the cache to our list
    caches.set('cache', cache);
    // Waitin util all the caches are ready to install the worker
    event.waitUntil(
        caches.ready()
    );
});

/**
 * Handle fetches and navigates
 */
this.addEventListener('fetch', function (event) {
    console.log('event.request.url', event.request.url.toString());
    event.respondWith(
        // Try to find the URL in the cache first
        caches.match(event.request.url).catch(function () {
            console.log("No match for", event.request.url.toString());
            // In the event of a failure, go to the network
            return fetch(event.request.url);
        })
    );
});

/**
 * postMessage from a page we're in control of
 */
this.addEventListener('message', function (event) {
    console.log('message event data', event.data);
});