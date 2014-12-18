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

    visitReturnStatement: function(path) {
      if (this.shouldBeModuleExports(path)) {
        return generateExports(path.value.argument);
      }

      this.traverse(path);
    },

    visitAMDModule: function(path) {
      var node = path.node;
      var dependencies = this.transformedDependencies(path);
      var moduleBody = this.transformedModuleBody(path);
      if (moduleBody) {
        if (!dependencies || dependencies.length === 0) {
          return moduleBody;
        }

        // replace the AMD CallExpression itself
        var p = path.parent;
        return p.replace.apply(p, dependencies.concat(moduleBody));
      }

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

    transformedModuleBody: function(path) {
      var node = path.node;
      var body = this.extractModuleBody(path);

      if (body) {
        if (n.ObjectExpression.check(body)) {
          return generateExports(body);
        }
        else if (n.FunctionExpression.check(body)) {
          this.traverse(path);
          return body.body;
        }
      }

      return path;
    },

    hasAncestor: function(path, descriptor, maxDepth) {
      if (typeof descriptor.validator !== 'function') {
        assert.ok(descriptor.type);
        assert.ok(!!n[descriptor.type]);
      }

      function lookup(path, currentDepth) {
        if (currentDepth > maxDepth || typeof path === 'undefined') {
          return false;
        }

        if (descriptor.validator(path.parent)) {
          return true;
        }

        return lookup(path.parent, currentDepth + 1);
      }

      return lookup(path.parent, 0);
    },

    shouldBeModuleExports: function(path) {
      var self = this;
      return this.hasAncestor(path, {
        validator: this.isAMDDefinition
      }, 3);
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
      var factory = last(node.arguments);

      var args = node.arguments;

      if (n.ArrayExpression.check(dependencies)) {
        dependencies = dependencies.elements;
      }
      else {
        // TODO: lookup variable
        // dependencies = find(dependencies);
      }

      return zip(dependencies, factory.params);
    },

    /**
     * @param {NodePath} path AMD Call Expression
     * @return {Array} {value: Identifier|String, module: String}
     */
    extractModuleBody: function(path) {
      assert.ok(this.isAMDDefinition(path));
      var node = path.node;
      return last(node.arguments);
    },
  }),
});

function last(a) {
  return a[a.length - 1];
}

function zip(a, b) {
  return a.map(function(a, i) {
    return [a, b[i]];
  });
}
