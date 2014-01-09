var util = require('util');
var hide = require('hide-key');
var _instanceOf = require('../lib/_instanceOf');
var Event = require('../spec/Event');
var Response = require('../spec/Response');
var SameOriginResponse = require('../spec/SameOriginResponse');
var Promise = require('rsvp').Promise;
var URL = require('dom-urls');
util.inherits(FetchEvent, Event);

module.exports = FetchEvent;

function FetchEvent(type, request, _responder) {
    Event.call(this, 'fetch');
    this.type = type;
    hide(this, '_responder', _responder);
    this.request = request;
    this.isTopLevel = false;
}

FetchEvent.prototype.respondWith = function (response) {
    if (!_instanceOf(response, Response) && !_instanceOf(response, Promise)) {
        throw new TypeError('respondWith requires a Reponse or a Promise');
    }

    this.stopImmediatePropagation();

    var responsePromise = response;
    if (_instanceOf(response, Response)) {
        responsePromise = new Promise(function (resolve, reject) {
            resolve(response);
        });
    }

    return responsePromise.then(
        this._responder.respond.bind(this._responder)
    ).then(null, function (why) {
        console.error('_responder error', why);
        console.error(why.stack);
        throw why;
    });
};

FetchEvent.prototype.forwardTo = function(url) {
    if (typeof url !== 'string' && !(url instanceof URL)) {
        throw new TypeError('forwardTo requires a string or a URL');
    }

    return this.respondWith(
        new Response({
            statusCode: 302,
            headers: { "Location": url.toString() }
        })
    );
}
