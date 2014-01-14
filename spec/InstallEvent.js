var util = require('util');
var Promise = require('rsvp').Promise;
var PromiseEvent = require('../spec/PromiseEvent');
var hide = require('hide-key');

util.inherits(InstallEvent, PromiseEvent);
module.exports = InstallEvent;

function InstallEvent(onReplace) {
    PromiseEvent.call(this, 'install');
    this._onReplace = onReplace || function(){};
}

InstallEvent.prototype.replace = function() {
  this._onReplace();
};