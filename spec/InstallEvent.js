var util = require('util');
var Promise = require('rsvp').Promise;
var InstallPhaseEvent = require('../spec/InstallPhaseEvent');
var hide = require('hide-key');

util.inherits(InstallEvent, InstallPhaseEvent);
module.exports = InstallEvent;

function InstallEvent(onReplace) {
    InstallPhaseEvent.call(this, 'install');
    this._onReplace = onReplace || function(){};
}

InstallEvent.prototype.replace = function() {
  this._onReplace();
};