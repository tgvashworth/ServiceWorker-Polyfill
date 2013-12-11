var util = require('util');
var hide = require('./_hide');
var _instanceOf = require('./_instanceOf');
var Event = require('./Event');
var Response = require('./Response');
var SameOriginResponse = require('./SameOriginResponse');
var Promise = require('promise');
util.inherits(FetchEvent, Event);

module.exports = FetchEvent;

function FetchEvent(request, _responder) {
    Event.call(this, 'fetch');
    hide(this, '_responder', _responder);
    this.request = request;
    this.type = _responder.requestType;
    this.isTopLevel = false;
    if (this.type === "navigate") {
        this.isTopLevel = true;
    }
}

FetchEvent.prototype.respondWith = function (response) {
    if (!_instanceOf(response, Response) && !_instanceOf(response, Promise)) {
        throw new TypeError('respondWith requires a Reponse or a Promise');
    }

    this.stopImmediatePropagation();

    var responsePromise = response;
    if (_instanceOf(response, Response)) {
        responsePromise = new Promise(function (resolve, respond) {
            resolve(response);
        });
    }

    return responsePromise.then(
        this._responder.respond.bind(this._responder),
        this._responder.respondWithNetwork.bind(this._responder)
    ).then(null, function (why) {
        console.error('_responder error', why);
        throw why;
    })
};
