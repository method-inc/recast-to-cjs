/*global it*/
var assert = require('assert');
var tocjs = require('..');
var fs = require('fs');
var path = require('path');
var read = fs.readFileSync;
var readdir = fs.readdirSync;

describe('should transform', function(){
  readdir('test/cases').forEach(function(file){
    if (file.indexOf('.out') > -1) return;
    var base = path.basename(file, '.js');
    var f = 'test/cases/' + file;
    var input = read(f, 'utf8');
    var output = read('test/cases/' + base + '.out.js', 'utf8');
    it(base, function(done) {
      tocjs(f, {dryrun: true}, function(err, file, transformed) {
        assert.equal(transformed.trim(), output.trim());
        done();
      });
    })
  });
});
