var recast = require('recast');
var b = recast.types.builders;
var n = recast.types.namedTypes;

/**
 * Return the AST for `var variable = require(module);` or `require(module);`
 * @param {String} module
 * @param {String} [identifier]
 * @example:
 *  recast.print(generateCJSExpr('React', 'react/addons').code;
 *  -> var React = require('react/addons');
 */
module.exports = function generateCJSExpr(module, identifier) {
  if (typeof identifier === 'string' && !n.Identifier.check(identifier)) {
    identifier = b.identifier(identifier);
  }

  if (!n.Literal.check(module)) {
    module = b.literal(module);
  }

  var requireExpression = b.callExpression(
    b.identifier('require'), [
      module
    ]
  );

  if (identifier) {
    return b.variableDeclaration("var", [
      b.variableDeclarator(
        identifier,
        requireExpression
      )
    ]);
  }

  // console.warn('Unnamed dependency: %s', module.value);
  return b.expressionStatement(requireExpression);
}

