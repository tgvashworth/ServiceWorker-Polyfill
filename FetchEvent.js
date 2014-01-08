var util = require('util');
var hide = require('hide-key');
var _instanceOf = require('./_instanceOf');
var Event = require('./Event');
var Response = require('./Response');
var SameOriginResponse = require('./SameOriginResponse');
var Promise = require('rsvp').Promise;
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
