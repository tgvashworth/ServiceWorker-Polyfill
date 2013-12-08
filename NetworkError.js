var util = require('util');
util.inherits(NetworkError, Error);

module.exports = NetworkError;

function NetworkError(statusCode) {
    Error.call(this, 'Network request failed with status code: ' + statusCode);
}
