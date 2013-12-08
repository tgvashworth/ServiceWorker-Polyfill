this.version = 2;

var caches = this.caches;
this.addEventListener('install', function (e) {
  e.services = ['fetch'];

  // Create a new cache and register it with the name 'app-1'
  // These resources are immediately cached
  var cache = new Cache('app.2.css');
  caches.set('app-2', cache);

  console.log('== foreaching ========================');
  caches.forEach(console.log.bind(console));
  console.log('== done ========================');
  console.log('caches.keys', caches.keys);
  console.log('caches.items', caches.items);
  console.log('caches.values', caches.values);
  console.log('caches.size', caches.size);

  // Delay registration until the cache(s) are filled
  caches.ready().then(function () {
    console.log('Caches ready!');
    console.log('caches', caches);
  }, function (why) {
    console.log('Caching failed', why);
  });
});

this.addEventListener('fetch', function (e) {
  console.log(e.request.method, e.request.url, e.request.headers);
  // Try to grab the thing from the cache
  // e.respondWith(this.caches.match(e.request.url));
});