var util = require('util');
var Event = require('./Event');
util.inherits(InstallEvent, Event);

module.exports = InstallEvent;

function InstallEvent() {
    Event.call(this, 'install');
    this.services = [];
}
