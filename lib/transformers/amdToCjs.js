var recast = require('recast');
// keep this private and not mutatable

module.exports = function(code) {
  var ast = recast.parse(code);
  recast.visit(ast, module.exports.__visitors);
  return recast.print(ast).code;
};

Object.defineProperty(module.exports, '__visitors', {
  enumerable: false,
  configurable: false,
  value: Object.freeze({
    visitCallExpression: function(path) {
      if (this.isAMDDefinition(path)) {
        return this.visitAMDModule(path);
      }

      this.traverse(path);
    },

    visitAMDModule: function(path) {
      //console.log('visitAMDModule', path.node.callee.name);

      return this.traverse(path);
    },

    isAMDDefinition: function(path) {
      var node = path.node;
      return isCallExpressionNamed('require') || isCallExpressionNamed('define');

      function isCallExpressionNamed(name) {
        return (n.CallExpression.check(node) &&
                name === node.callee.name);
      }
    }
  }),
});

