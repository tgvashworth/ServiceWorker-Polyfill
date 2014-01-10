var util = require('util');
var AsyncMap = require('../spec/AsyncMap');
util.inherits(CacheItemList, AsyncMap);

module.exports = CacheItemList;

function CacheItemList() {
    AsyncMap.call(this);
}