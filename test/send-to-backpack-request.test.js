var _ = require('underscore');
var should = require('should');
var badgehost = require('badgehost');

var SendToBackpackRequest = require('../').SendToBackpackRequest;

var badgehostApp;

var badgeFor = function(recipient, uid) {
  return badgehostApp.url('demo.json', {
    set: {
      uid: uid || 'uid-1',
      recipient: {
        type: "email",
        hashed: false,
        identity: recipient
      }
    }
  })
};

before(function(done) {
  badgehostApp = badgehost.app.build();
  badgehostApp.listen(function() {
    badgehostApp.server = this;
    done();
  });
});

after(function() {
  badgehostApp.server.close();
});

describe("SendToBackpackRequest", function() {
  var validRequest = function(backpackMethods, cb) {
    if (!cb) {
      cb = backpackMethods;
      backpackMethods = {};
    }
    return SendToBackpackRequest(_.extend({
      owner: "a@example.org",
      has: function(guid, cb) { cb(null, false); },
    }, backpackMethods), badgeFor("a@example.org"), cb);
  };

  it("returns 'invalid' for URLs that 404", function(done) {
    SendToBackpackRequest({}, badgehostApp.url('404'), function(err, req) {
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

describe("SendToBackpackRequest.Group", function() {
  var backpack;
  var FakeBackpack = function(owner) {
    var self = {
      owner: owner,
      _badges: {}
    };

    self.has = function(guid, cb) {
      cb(null, (guid in self._badges));
    };

    self.receive = function(info, cb) {
      info.guid.should.be.a('string');
      self._badges[info.guid] = info;
      cb(null);
    };

    return self;
  };

  beforeEach(function() {
    backpack = FakeBackpack('a@example.org');
  });

  it("should report non-fatal problems", function(done) {
    SendToBackpackRequest.Group(backpack, [
      badgeFor('b@example.org'),
      badgehostApp.url('404')
    ], function(err, group) {
      should.equal(err, null, "no fatal errors");
      group.length.should.eql(2);
      group[0].result.should.eql('recipient_mismatch');
      group[1].result.should.eql('invalid');
      done();
    });
  });

  it("should allow accepting of all valid badges", function(done) {
    SendToBackpackRequest.Group(backpack, [
      badgeFor('b@example.org'),
      badgehostApp.url('404'),
      badgeFor('a@example.org', '1'),
      badgeFor('a@example.org', '2')
    ], function(err, group) {
      should.equal(err, null, "no fatal errors");
      group.acceptAll(function(err) {
        should.equal(err, null);
        group[2].result.should.eql('accepted');
        group[3].result.should.eql('accepted');
        done();
      });
    });
  });

  it("should allow rejecting of all valid badges", function(done) {
    SendToBackpackRequest.Group(backpack, [
      badgehostApp.url('404'),
      badgeFor('a@example.org', '1'),
      badgeFor('a@example.org', '2')
    ], function(err, group) {
      should.equal(err, null, "no fatal errors");
      group.rejectAll(function(err) {
        should.equal(err, null);
        group[1].result.should.eql('rejected');
        group[2].result.should.eql('rejected');
        done();
      });
    });
  });

  it('should propagate fatal errors', function(done) {
    SendToBackpackRequest.Group({
      owner: 'a@example.org',
      has: function(guid, cb) { cb(new Error("BACKPACK KABOOM")); }
    }, [badgeFor('a@example.org')], function(err) {
      err.message.should.eql("BACKPACK KABOOM");
      done();
    });
  });
});
