var getPrototypeChain = require('./getPrototypeChain');

module.exports = function (o, constructor) {
    var chain = getPrototypeChain(o);
    var match = constructor;
    if (typeof constructor === 'function') {
        match = constructor.name;
    }
    return (chain.indexOf(match) > -1);
};