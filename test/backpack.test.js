var should = require('should');
var backpack = require('../').backpack;

var inFiber = require('./lib/fiber-mocha');

describe("backpack.forUser()", function() {
  it("should work w/ no email", inFiber(function() {
    backpack.forUser(undefined).owner.should.eql("default");
  }));

  it("should work w/ email", inFiber(function() {
    backpack.forUser("a@example.org").owner.should.eql("a@example.org");
  }));
});
