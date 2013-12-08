this.version = 1;

this.addEventListener('install', function (e) {
    // console.log('Install!', e)
    e.services = ['fetch'];
});

this.addEventListener('fetch', function (e) {
    console.log(e.request.method, e.request.url, e.request.headers);
    e.respondWith(new SameOriginResponse({
        statusCode: 200,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: 'Tom',
            age: 20
        })
    }));
});