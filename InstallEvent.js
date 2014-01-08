var util = require('util');
var Promise = require('rsvp').Promise;
var PromiseEvent = require('./PromiseEvent');
var hide = require('hide-key');

util.inherits(InstallEvent, PromiseEvent);
module.exports = InstallEvent;

function InstallEvent(resolve, reject) {
    PromiseEvent.call(this, 'install', resolve, reject);
    this.services = [];
}