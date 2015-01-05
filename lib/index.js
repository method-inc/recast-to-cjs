var glob = require('glob');
var fs = require('fs');
var read = fs.readFileSync;
var transformers = require('./transformers');

var DEFAULT_WRITE_CALLBACK = function(err, file, output) {
  if (err) {
    return console.error(err);
  }
  fs.writeFileSync(file, output);
};

var DEFAULT_LOG_CALLBACK = function(err, file, output) {
  console.log('%s\n%s\n', file, output);
};

/**
 * @param {String|Array} g glob string or array of files to transform
 * @param {Object} [options] {dryrun: Boolean, transformer: String}
 * @param {Function} [callback] Callback to receive (err, filename, transformed)
 */
module.exports = function(g, options, callback) {
  if (typeof callback !== 'function') {
    callback = options.dryrun ? DEFAULT_LOG_CALLBACK : DEFAULT_WRITE_CALLBACK;
  }

  if (Array.isArray(g)) work(g);
  else {
    glob(g, function(error, files) {
      work(files);
    });
  }

  function work(files) {
    return files.forEach(function(file) {
      var content = read(file).toString();
      var output;

      try {
        console.log('Transforming %s', file);
        return respond(file, transform(content, options.transformer), callback);
      }
      catch(e) {
        console.error('Error transforming %s', file);
        return respond(file, e, callback);
      }
    });
  }
}

/**
 * Helper function to transform code
 *
 * @param {String} code javascript string
 * @param {String} [method] transformer method from lib/transformers/index.js
 */
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
  setImmediate(function() {
    if (typeof output === 'string')
      callback(null, file, output);
    else {
      // error case. file, error, callback
      callback(output, file);
    }
  });
}

