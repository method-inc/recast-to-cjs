var recast = require('recast');

module.exports = function identity(code) {
  var ast = recast.parse(code);
  return recast.print(ast).code;
}

