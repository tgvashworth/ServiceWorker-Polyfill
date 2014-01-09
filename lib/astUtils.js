var _ = require('lodash');

exports.isCall = function (node) {
  return (node.type === "CallExpression");
};

exports.isObject = function (node) {
  return node.type === 'ObjectExpression';
};

var propValue = function (property) {
  var propertyKey = 'name';
    // Support literals or identifiers (['blah'] or .blah)
  if (property.value) propertyKey = 'value';
  return property[propertyKey];
};

exports.objectName = function (object) {
  if (object.type === 'ThisExpression') return 'this';
  if (object.value) return object.value;
  return object.name;
};

// Is thie node a call to...
// TODO document this
exports.isCallTo = function (node) {
  if (!exports.isCall(node)) return false;

  var args = [].slice.call(arguments);
  var methods = args.pop();
  var properties = args.slice(1);

  // Methods must be an array
  if (typeof methods === "string") methods = [methods];

  var callee = node.callee;
  if (!callee) return false;

  var calleeMethod = exports.objectName(callee.property || callee);
  if (!_.contains(methods, calleeMethod)) return false;

  var currPropArr, lastPropArr, curr = callee;
  while (currPropArr = properties.pop()) {
    // Make sure it's an array
    if (typeof currPropArr === "string") currPropArr = [currPropArr];
    lastPropArr = currPropArr;
    curr = curr.object;
    if (!curr) {
      return false;
    }
    // Support * for any method, jump to next property
    if (_.contains(currPropArr, '*')) continue;
    // The final object will have no property
    if (!_.contains(currPropArr, exports.objectName(curr.property || curr))) return false;
  }
  // If there are properties left over, or the object we've reached has further objects then
  // we haven't found the correct call – unless the last property array contained a *
  if (_.contains(lastPropArr, '*')) return true;
  if (properties.length || (curr && curr.property)) return false;

  return true;
};