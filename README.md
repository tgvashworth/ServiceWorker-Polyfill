# ServiceWorker demo

This is a polyfill for the [ServiceWorker](https://github.com/slightlyoff/ServiceWorker) specification. The idea is to enable exploration of the ServiceWorker API and the implications it has for users, applications and developer workflow.

**NOTE:** This may be broken for you. Please [submit an issue](https://github.com/phuu/serviceworker-demo/issues/new).

## Setup

### Requirements

- Node + npm
- Possibly OSX – I haven't tried on other platforms

You'll probably need to be able host a local server and give it a different hostname than `localhost`. You could try [`distra`](https://github.com/phuu/distra) for this, but there are other ways. You could also use a remote server.

### Install

In theory:

```
$ npm install -g serviceworker && serviceworker
```

This will start an instance of Chrome Canary and a ServiceWorker proxy server. All requests from Canary will go through the proxy.

Point Canary to a (local) site, add some ServiceWorker stuff and off you go!

### Architecture

Here's the general idea.

1. Page requests something
2. Chrome extension picks up the request and adds an `X-Service-Worker-Request-Type` header.
3. Proxy follows the ServiceWorker spec to check if there's a worker registered for the page, and puts request through it.
4. The worker generates a response or allows the request to go to the network
5. ServiceWorker server returns response to page

There's also registration, install and activation steps. Check the spec for this.

### Notes

- This stuff (possibly) doesn't play nice with VPNs.
- No HTTPS

## Contributing

[Submit an issue](https://github.com/phuu/serviceworker-demo/issues/new) or pull request!
