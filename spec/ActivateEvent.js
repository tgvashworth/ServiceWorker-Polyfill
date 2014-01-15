var util = require('util');
var InstallPhaseEvent = require('../spec/InstallPhaseEvent');

util.inherits(ActivateEvent, InstallPhaseEvent);
module.exports = ActivateEvent;

function ActivateEvent(resolve, reject) {
    InstallPhaseEvent.call(this, 'activate', resolve, reject);
}