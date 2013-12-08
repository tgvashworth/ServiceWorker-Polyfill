module.exports = function (obj, key, val) {
    Object.defineProperty(obj, key, {
        value: val
    });
};