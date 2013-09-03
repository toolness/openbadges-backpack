var should = require('should');
var backpack = require('../').backpack;

describe("backpack.forUser()", function() {
  it("should work w/ no email", function(done) {
    backpack.forUser(undefined, function(err, backpack) {
      if (err) return done(err);
      backpack.owner.should.eql("default");
      done();
    });
  });

  it("should work w/ email", function(done) {
    backpack.forUser("foo@example.org", function(err, backpack) {
      if (err) return done(err);
      backpack.owner.should.eql("foo@example.org");
      done();
    });
  });
});
