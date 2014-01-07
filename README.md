# ServiceWorker demo

This is a (partial) [ServiceWorker](https://github.com/slightlyoff/ServiceWorker) implementation, written in JavaScript. The idea is to enable exploration of the ServiceWorker API and the implications it has for users, applications and developer workflow.

**NOTE:** This not easy to run, and may be broken. Sorry – we'll try to make it easier as time goes on.

## Setup

It's a bit complicated.

### Requirements

- Node + npm
- Possibly OSX – I haven't tried on other platforms

You'll need to be able host a local server and give it a different hostname than `localhost` - this will be your *network host*. I'd recommend `demosite-origin.dev`. You'll use `demosite.dev` (so, no `-origin` bit) to hit the service worker. This second host is your *local host*.

I built [`distra`](https://github.com/phuu/distra) which can do this, but there are other ways. You could also use a remote server (I think, not tried).

### Architecture

Here's the general idea.

1. Page requests something
2. Chrome extension picks up that it should be sent to the ServiceWorker and adds `X-For-Service-Worker` header.
3. Proxy detects header and puts request through the ServiceWorker server
3. ServiceWorker server transforms the request back, and passes to the worker which generates response
4. ServiceWorker might go to the network, pretending to be the page. If the request was to the same origin as the page (ie, the **local origin**) then the ServiceWorker will hit the **network origin**.
5. ServiceWorker server returns response to page

### Starting it up

Using distra makes the following setup a lot easier:

```bash
# Leave this running
sudo distra 80

# Run this in a seperate terminal
distra add serviceworker-resources.dev
cd site
distra add demosite.dev
distra add demosite-origin.dev
```

1. Start the *network origin server* to serve the `site/` directory. You should be able to access it as you would any other website, ie. opening [http://demosite-origin.dev/](http://demosite-origin.dev/) should show you the "Regular old index page". (Covered by distra)
2. Configure your machine/browser's HTTP proxy settings to go through the proxy. By default, this will be `localhost:5678`.
3. Install the dependencies with `npm install`.
4. Start the SevicerWorker server. Run `node --harmony server.js 5678 http://demosite.dev/ http://demosite-origin.dev/ worker.js`.
5. Install the unpacked Chrome extension from the `devtools/` folder of this project. You *must* have devtools open when testing this stuff; the devtools extension connects to the ServiceWorker server via WebSocket to inform it when a navigation is occuring.
6. Start the *ServiceWorker resources server* to serve the root of the project directory under the name `serviceworker-resource.dev` (**note:** you might have covered by using distra, above)

You should now be able to visit the **local** origin ([http://demosite.dev/](http://demosite.dev/)) and have it proxy through to the **network** origin, and see logging from the ServiceWorker coming from node. They'll be prefixed with `sw: `.

You can now add to the `worker.js` to play with the API. Lots of stuff is missing, but the core request interception, caching and response APIs are there.

### Worker activation flow

In case you're interested. This might not quite be accurate; it's here as a mental note.

```
new worker detected
    reload
    not different?
        return
    setup (new)
    install (new)
    save new as next

new request
    if next is waiting
        activate (current, next)
            activate (next)
            set next as current
            then
                resolve
    otherwise
        resolve
    then
        push request through worker
```

### Notes

- This stuff doesn't play nice with VPNs.
- No HTTPS

## Contributing

Add an issue or submit a PR or two!

If you're adding a "class" *not* from the spec, please prefix it with an underscore.
