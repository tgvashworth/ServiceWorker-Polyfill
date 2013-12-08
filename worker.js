this.version = 2;

var caches = this.caches;
this.addEventListener('install', function (e) {
    console.log('== install ========================');
    e.services = ['fetch'];

    // Create a new cache and register it with the name 'app-1'
    // These resources are immediately cached
    var cache = new Cache('app.2.css');
    caches.set('app-2', cache);

    // console.log('== foreaching ========================');
    // caches.forEach(console.log.bind(console));
    // console.log('== done ========================');
    // console.log('caches.keys', caches.keys);
    // console.log('caches.values', caches.values);
    // console.log('caches.size', caches.size);

    // Delay registration until the cache(s) are filled
    caches.ready().then(function () {
      console.log('Caches ready!');
    }, function (why) {
      console.log('Caching failed', why);
    });

    e.waitUntil(caches.ready()).then(function () {
        console.log('caches.items', caches.items);
        console.log('== install done ========================');
    }, function (why) {
        console.log('== install failed ========================');
        console.log(why);
    });
});

this.addEventListener('fetch', function (e) {
    console.log(e.request.method, e.request.url, e.request.headers);
    // Try to grab the thing from the cache
    e.respondWith(
        caches.match(e.request.url)
    );
    // e.respondWith(new SameOriginResponse({
    //   statusCode: 200,
    //   headers: {
    //       'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify({ name: 'jack' })
  // }));
});