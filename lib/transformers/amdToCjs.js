var recast = require('recast');
var assert = require('assert');
var generators = require('../generators');
var generateRequire = generators.require;
var generateExports = generators.exports;

module.exports = function(code) {
  var ast = recast.parse(code);
  recast.visit(ast, module.exports.__visitors);
  return recast.print(ast).code;
};

// keep this private and not mutatable
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
      var node = path.node;
      var dependencies = this.transformedDependencies(path);
      var moduleBody = this.extractModuleBody(path);
      var result;

      //(dependencies || []).forEach(print);

      return this.traverse(path);
    },

    isAMDDefinition: function(path) {
      var node = path.node;
      return isCallExpressionNamed('require') || isCallExpressionNamed('define');

      function isCallExpressionNamed(name) {
        return (n.CallExpression.check(node) &&
                name === node.callee.name);
      }
    },

    transformedDependencies: function(path) {
      var node = path.node;
      var dependencies = this.extractAMDDependencies(path);

      if (dependencies) {
        return dependencies.map(function(a) {
          return generateRequire(a[0], a[1]);
        });
      }

      return null;
    },

    /**
     * @param {NodePath} path AMD Call Expression
     * @return {Array} {value: Identifier|String, module: String}
     */
    extractAMDDependencies: function(path) {
      assert.ok(this.isAMDDefinition(path));

      var node = path.node;
      // TODO: http://requirejs.org/docs/whyamd.html#namedmodules
      if (node.arguments.length < 2) return null;

      var dependencies = node.arguments[0];
      var factory = node.arguments[1];

      var args = node.arguments;

      if (n.ArrayExpression.check(dependencies)) {
        dependencies = dependencies.elements;
      }
      else {
        // TODO: lookup variable
        // dependencies = find(dependencies);
      }

      return zip(dependencies, factory.params);
    }
  }),
});

function zip(a, b) {
  return a.map(function(a, i) {
    return [a, b[i]];
  });
}
