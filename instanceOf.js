var getPrototypeChain = require('./getPrototypeChain');

module.exports = function (o, constructor) {
    var chain = getPrototypeChain(o);
    var match = constructor;
    if (typeof constructor === 'function') {
        match = constructor.name;
    }
    console.log('chain', chain);
    console.log('constructor.name', constructor.name);
    console.log('match', match);
    console.log('chain.indexOf(match)', chain.indexOf(match));
    console.log('(chain.indexOf(match) > -1)', (chain.indexOf(match) > -1));
    return (chain.indexOf(match) > -1);
};