var util = require('util');
var hide = require('./hide');
var instanceOf = require('./instanceOf');
var Event = require('./Event');
var Response = require('./Response');
var SameOriginResponse = require('./SameOriginResponse');
var Promise = require('promise');
util.inherits(FetchEvent, Event);

module.exports = FetchEvent;

function FetchEvent(request, responder) {
    Event.call(this, 'fetch');
    hide(this, '_responder', responder);
    this.request = request;
}

FetchEvent.prototype.respondWith = function (response) {

    if (!instanceOf(response, Response) && !instanceOf(response, Promise)) {
        throw new TypeError('respondWith requires a Reponse or a Promise');
    }

    this.stopImmediatePropagation();

    var responsePromise = response;
    if (instanceOf(response, Response)) {
        responsePromise = new Promise(function (resolve, respond) {
            resolve(response);
        });
    }

    return responsePromise.then(
        this._responder.respond.bind(this._responder),
        this._responder.respondWithNetwork.bind(this._responder)
    );
};
