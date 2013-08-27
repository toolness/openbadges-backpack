var _ = require('underscore');
var should = require('should');
var badgehost = require('badgehost');

var SendToBackpackRequest = require('../').SendToBackpackRequest;

describe("SendToBackpackRequest", function() {
  var app = badgehost.app.build();
  var server;
  var badgeFor = function(recipient) {
    return app.url('demo.json', {
      set: {
        recipient: {
          type: "email",
          hashed: false,
          identity: "a@example.org"
        }
      }
    })
  };
  var validRequest = function(backpackMethods, cb) {
    if (!cb) {
      cb = backpackMethods;
      backpackMethods = {};
    }
    return SendToBackpackRequest(_.extend({
      owner: "a@example.org",
      has: function(guid, cb) { cb(null, false); }
    }, backpackMethods), badgeFor("a@example.org"), cb);
  };

  before(function(done) {
    app.listen(function() {
      server = this;
      done();
    });
  });

  after(function() {
    server.close();
  });

  it("returns 'invalid' for URLs that 404", function(done) {
    SendToBackpackRequest({}, app.url('404'), function(err, req) {
      should.equal(err, null, "error is not fatal");
      req.result.should.eql("invalid");
      req.canBeAccepted.should.equal(false);
      done();
    });
  });

  it("returns 'recipient_mismatch'", function(done) {
    SendToBackpackRequest({
      owner: "b@example.org"
    }, badgeFor("a@example.org"), function(err, req) {
      should.equal(err, null, "error is not fatal");
      req.error.message.should.eql("badge recipient is not b@example.org");
      req.result.should.eql("recipient_mismatch");
      req.canBeAccepted.should.equal(false);
      done();
    });
  });

  it("returns 'backpack_error' when existence check fails", function(done) {
    SendToBackpackRequest({
      owner: "a@example.org",
      has: function(guid, cb) {
        guid.should.match(/^([A-Za-z0-9]+)$/);
        cb(new Error("BACKPACK KABOOM"));
      }
    }, badgeFor("a@example.org"), function(err, req) {
      err.message.should.eql("BACKPACK KABOOM");
      req.error.should.equal(err);
      req.result.should.eql("backpack_error");
      req.canBeAccepted.should.equal(false);
      done();
    });
  });

  it("returns 'exists' when badge is already in backpack", function(done) {
    SendToBackpackRequest({
      owner: "a@example.org",
      has: function(guid, cb) { cb(null, true); }
    }, badgeFor("a@example.org"), function(err, req) {
      should.equal(err, null, "error is not fatal");
      req.error.message.should.eql("badge is already in backpack");
      req.result.should.eql("exists");
      req.canBeAccepted.should.equal(false);
      done();
    });
  });

  it("sets canBeAccepted", function(done) {
    validRequest(function(err, req) {
      should.equal(err, null);
      should.equal(req.error, null);
      should.equal(req.result, null, "request is awaiting permission");
      req.canBeAccepted.should.equal(true);
      done();
    });
  });

  it("returns 'rejected'", function(done) {
    validRequest(function(err, req) {
      req.reject(function(err) {
        should.equal(err, null);
        should.equal(req.error, null);
        req.result.should.eql('rejected');
        req.canBeAccepted.should.equal(false);
        done();
      });
    });
  });

  it("returns 'backpack_error' when accepting fails", function(done) {
    validRequest({
      receive: function(info, cb) { cb(new Error('BACKPACK KABOOM')); }
    }, function(err, req) {
      req.accept(function(err) {
        err.message.should.eql('BACKPACK KABOOM');
        req.error.should.equal(err);
        req.result.should.eql('backpack_error');
        req.canBeAccepted.should.equal(false);
        done();
      });
    });
  });

  it("returns 'accepted'", function(done) {
    validRequest({
      receive: function(info, cb) {
        info.structures.assertion.recipient.identity
          .should.eql('a@example.org');
        cb(null);
      }
    }, function(err, req) {
      req.accept(function(err) {
        should.equal(err, null);
        should.equal(req.error, null);
        req.result.should.eql('accepted');
        req.canBeAccepted.should.equal(false);
        done();
      });
    });
  });
});
