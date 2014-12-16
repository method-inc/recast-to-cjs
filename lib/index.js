var glob = require('glob');
var fs = require('fs');
var read = fs.readFileSync;
var transformers = require('./transformers');

module.exports = function(g, options, callback) {
  glob(g, function(error, files) {
    return files.forEach(function(file) {
      var content = read(file).toString();

      try {
        var output = transform(content);
      }
      catch(e) {
        return respond(file, e, callback);
      }

      if (options.dryrun) {
        return respond(file, output, callback);
      }
      else {
        fs.writeFileSync(output);
      }
    });
  });
}

function transform(code, method) {
  return transformers[method || 'identity'](code);
}

/**
 * Helper function to handle dryrun response for CLI or node-based usage.
 *
 * @param {String} file
 * @param {String|Error} output
 * @param {Function} [callback]
 */
function respond(file, output, callback) {
  if (typeof callback === 'function')  {
    setImmediate(function() {
      if (typeof output === 'string') {
        callback(null, file, output);
      }
      else {
        // error case
        callback(output, file);
      }
    });
  }
  else console.log(output);
}

