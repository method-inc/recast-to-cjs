var types = require('recast').types;
var n = types.namedTypes;

function findIdentifier(variable, ast) {
  var result = false;

  types.visit(ast, {
    visitVariableDeclarator: function(path) {
      if (path.value.id.name === variable) {
        result = path.value.init;
        return false;
      }
      this.traverse(path);
    },
  });

  return result;
}

module.exports = findIdentifier;
