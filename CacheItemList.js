var util = require('util');
var urlLib = require('url');
var CacheList = require('./CacheList');
util.inherits(CacheItemList, CacheList);

module.exports = CacheItemList;

function CacheItemList() {
    CacheList.call(this);
}