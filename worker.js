this.version = 2;

this.addEventListener('install', function (e) {
  e.services = ['fetch'];

  // Create a new cache and register it with the name 'app-1'
  // These resources are immediately cached
  var cache = new Cache('https://api.github.com/users/phuu');
  // this.caches.set('app-2', cache);

  // Delay registration until the cache(s) are filled
  cache.ready().then(function () {
    console.log('Cache ready!');
    console.log('cache', cache);
  }, function (why) {
    console.log('Caching failed', why);
  });
});

this.addEventListener('fetch', function (e) {
  console.log(e.request.method, e.request.url, e.request.headers);
  // Try to grab the thing from the cache
  // e.respondWith(this.caches.match(e.request.url));
});