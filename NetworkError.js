var util = require('util');
util.inherits(NetworkError, Error);

module.exports = NetworkError;

function NetworkError(response) {
    Error.call(this, 'Network request failed with status code: ' + response.statusCode);
    this.response = response;
}
