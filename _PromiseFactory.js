var Promise = require('promise');

module.exports = {
    RejectedPromise: function (value) {
        return new Promise(function (_, reject) {
            reject(value);
        });
    },
    ResolvedPromise: function (value) {
        return new Promise(function (resolve, _) {
            resolve(value);
        });
    }
};