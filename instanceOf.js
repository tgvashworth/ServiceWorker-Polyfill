var getPrototypeChain = require('./getPrototypeChain');

module.exports = function (o, constructor) {
    var chain = ['Object'];
    if (typeof o === "string") {
        chain.unshift('String');
    } else if (typeof o === "number") {
        chain.unshift('Number');
    } else {
        chain = getPrototypeChain(o);
    }
    var match = constructor;
    if (typeof constructor === 'function') {
        match = constructor.name;
    }
    return (chain.indexOf(match) > -1);
};