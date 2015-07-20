/*global it*/
var assert = require('assert');
var recast = require('recast');
var transformers = require('../lib/transformers/amdToCjs');
var visitors = transformers.__visitors;

describe('transformers', function(){
  var cases = [
    { code:
        [ 'define(function santa() {',
          '  return "claus";',
          '});' ].join('\n'),
      isAMDDefinition: true,
    },
    { code:
      [ 'require(["presents"], function claus(presents) {',
        '  return "santa";',
        '});' ].join('\n'),
      isAMDDefinition: true,
    },
    { code: 'var define = function() {};',
      isAMDDefinition: false,
    },
    { code: 'window.require({santa: "claus"});',
      isAMDDefinition: false,
    }
  ];

  function toAst(str) {
    return recast.parse(str);
  }

  xdescribe('amdToCjs', function() {
    it('should detect amd call expressions', function() {
      cases.forEach(function(c) {
        assert.equal(visitors.isAMDDefinition(toAst(c.code)) === c.isAMDDefinition);
      });
    });
  });
});
