/*global it*/
var assert = require('assert');
var tocjs = require('..');
var fs = require('fs');
var path = require('path');
var read = fs.readFileSync;
var readdir = fs.readdirSync;
var recast = require('recast');
var generators = require('../lib/generators');

describe('generating ASTs', function(){
  describe('require', function() {
    it('should generate with a variable, module syntax', function() {
      var output = generators.require('react/addons', 'React');
      var expected = 'var React = require("react/addons");';
      assert.equal(recast.print(output).code, expected);
    });

    it('should generate with a singular argument', function() {
      var output = generators.require('React');
      var expected = 'require("React");';
      assert.equal(recast.print(output).code, expected);
    });
  });

  describe('exports', function() {
    it('should module.exports', function() {
      var output = generators.exports({type: 'Identifier', name: 'myThing'});
      var expected = 'module.exports = myThing;';
      assert.equal(recast.print(output).code, expected);
    });
  });
});
