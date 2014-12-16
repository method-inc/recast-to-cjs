var recast = require('recast');
var b = recast.types.builders;
var n = recast.types.namedTypes;

/**
 * Return the AST for `var variable = require(module);`
 * @param {String} variable
 * @param {String} module]
 * @example:
 *  recast.print(generateCJSExpr('React', 'react/addons').code;
 *  -> var React = require('react/addons');
 */
module.exports = function generateCJSExpr(variable, module) {
  if (typeof module === 'undefined') {
    module = variable;
  }

  var identifier = b.identifier(variable);
  return b.variableDeclaration("var", [
    b.variableDeclarator(
      identifier,
      b.callExpression(b.identifier('require'), [
        b.literal(module)
      ])
    )
  ]);
}

