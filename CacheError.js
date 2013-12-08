var util = require('util');
util.inherits(CacheError, Error);

module.exports = CacheError;

function CacheError(message) {
    Error.call(this, message);
}
