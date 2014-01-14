var util = require('util');
var hide = require('hide-key');
var _instanceOf = require('../lib/_instanceOf');
var Event = require('../spec/Event');
var Response = require('../spec/Response');
var SameOriginResponse = require('../spec/SameOriginResponse');
var ResponsePromise = require('../spec/ResponsePromise');
var Promise = require('rsvp').Promise;
var URL = require('dom-urls');
util.inherits(FetchEvent, Event);

module.exports = FetchEvent;

function FetchEvent(type, request) {
    Event.call(this, 'fetch');
    this.type = type;
    hide(this, '_responsePromise', null);
    this.request = request;
    this.isTopLevel = false;
}

FetchEvent.prototype.respondWith = function (response) {
    if (this._isStopped()) {
        throw new Error('respondWith() can only be called once per fetch event');
    }

    if (!_instanceOf(response, Response) && !_instanceOf(response, Promise)) {
        throw new TypeError('respondWith requires a Reponse or a Promise');
    }

    this.stopImmediatePropagation();

    this._responsePromise = ResponsePromise.cast(response);

    return this._responsePromise;
};

FetchEvent.prototype.forwardTo = function(url) {
    if (typeof url !== 'string' && !(url instanceof URL)) {
        throw new TypeError('forwardTo requires a string or a URL');
    }

    return this.respondWith(
        new Response({
            statusCode: 302,
            headers: { 'Location': url.toString() }
        })
    );
};
