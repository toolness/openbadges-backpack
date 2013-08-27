var Fiber = require('fibers');
var should = require('should');

var fibrous = require('../').fibrous;

var asyncAddOne = fibrous(function(n, cb) {
  if (!cb) throw new Error("CALLBACK REQUIRED");

  process.nextTick(function() {
    cb(null, n + 1);
  });
});

describe("fibrous", function() {
  beforeEach(function() {
    fibrous.enabled = true;
  });

  it("should return unaltered function when disabled", function() {
    function foo() {}

    fibrous.enabled = false;
    fibrous(foo).should.equal(foo);
  });

  it("should return wrapped function when enabled", function() {
    function foo() {}

    fibrous(foo).should.not.equal(foo);
  });

  it("should run unaltered when not in a fiber", function() {
    (function() {
      asyncAddOne(5);
    }).should.throw('CALLBACK REQUIRED');
  });

  it("should block when run in a fiber, not passed a cb", function(done) {
    Fiber(function() {
      asyncAddOne(1).should.equal(2);
      done();
    }).run();
  });

  it("shouldn't block when run in a fiber, passed a cb", function(done) {
    Fiber(function() {
      asyncAddOne(1, function(err, n) {
        if (err) return done(err);
        n.should.equal(2);
        done();
      });
    }).run();
  });

});
