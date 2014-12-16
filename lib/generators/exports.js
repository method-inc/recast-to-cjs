var recast = require('recast');
var b = recast.types.builders;
var n = recast.types.namedTypes;

/**
 * Return a new module.exports expression with an object
 *
 * @param {Object} value a recast builder object or partial object
 * @example:
 *  recast.print(generateExportsExpr({type: 'Identifier', name: 'React'})).code;
 *  -> module.exports = React;
 */
module.exports = function generateExportsExpr(value) {
  return b.expressionStatement(b.assignmentExpression(
    '=',
    b.memberExpression(
      b.identifier('module'),
      b.identifier('exports'),
      false
    ),
    value
  ));
};

