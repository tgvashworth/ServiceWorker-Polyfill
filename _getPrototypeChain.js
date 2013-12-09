module.exports = function (o) {
    var chain = [];
    while (Object.getPrototypeOf(o)) {
        chain.push(Object.getPrototypeOf(o).constructor.name);
        o = Object.getPrototypeOf(o);
    }
    return chain;
}