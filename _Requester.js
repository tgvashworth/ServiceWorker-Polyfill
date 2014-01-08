var fs = require('fs');
var mime = require('mime');
var _networkRequest = require('request');
var Promise = require('rsvp').Promise;
var Response = require('./Response');
var NetworkError = require('./NetworkError');
var SameOriginResponse = require('./SameOriginResponse');
var URL = require('dom-urls');

module.exports = _Requester;

function _Requester() {}

_Requester.makeRequest = function (networkRequest, callback) {
    // Delete caching headers
    delete networkRequest.headers['If-Modified-Since'];
    delete networkRequest.headers['if-modified-since'];
    delete networkRequest.headers['If-None-Match'];
    delete networkRequest.headers['if-none-match'];
    delete networkRequest.headers['Cache-Control'];
    delete networkRequest.headers['cache-control'];
    // Convert from URL type back to string for requestin'
    networkRequest.url = networkRequest.url.toString();
    networkRequest.encoding = null;
    return _networkRequest(networkRequest, callback);
};