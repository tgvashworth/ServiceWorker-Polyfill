# ServiceWorker Polyfill

This is a polyfill for the [ServiceWorker](https://github.com/slightlyoff/ServiceWorker) specification. The idea is to enable exploration of the ServiceWorker API and the implications it has for users, applications and developer workflow.

**NOTE:** This may be broken for you. Please [submit an issue](https://github.com/phuu/serviceworker-polyfill/issues/new).

## Setup

### Requirements

- Node + npm
- Chrome Canary

This may only work on OSX. Sorry.

### Install

In theory:

```
$ npm install -g serviceworker && serviceworker
```

This will start an instance of Chrome Canary and a ServiceWorker proxy server. All requests from Canary will go through the proxy.

Point Canary to a (local) site, add some ServiceWorker stuff and off you go!

If you'd like a site to play with, try using the demo site in the `site` directory. You'll need to host the files with the domain `workerdemo.dev` – try using [distra](https://github.com/phuu/distra) for this.

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

[Submit an issue](https://github.com/phuu/serviceworker-polyfill/issues/new) or pull request!
