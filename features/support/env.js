var should = require('should');
var badgehost = require('badgehost');
var validator = require('openbadges-validator');
var fiberize = require('../../test/lib/fiber-cucumber');
var Future = require('fibers/future');
var SendToBackpackRequest = require('../../').SendToBackpackRequest;
var SendToBackpackRequestGroup = SendToBackpackRequest.Group;

var badgehostApp;

var DEFAULT_EMAIL = "me@example.org";

var FakeBackpack = function(owner) {
  var self = [];

  self.owner = owner;

  self.has = function(guid, cb) {
    return cb(null, self.indexOf(guid) != -1)
  };

  self.indexOfBadgeWithUrl = function(url) {
    var getAssertionGUID = Future.wrap(validator.getAssertionGUID);
    var guid = getAssertionGUID(url).wait();
    return Array.prototype.indexOf.call(self, guid);
  };

  self.receive = function(info, cb) {
    info.guid.should.be.a('string');
    self.indexOf(info.guid).should.eql(-1);
    self.push(info.guid);
    cb(null);
  };

  return self;
};

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

function IssuerSite() {
  var self = this;
 
  var uid_n = 1;

  self.loggedInUser = DEFAULT_EMAIL;
  self.issuedBadges = []; // NOTE: issued, not sent

  self.issueBadge = function() {
    self.issuedBadges.push(badgeFor(self.loggedInUser, 'uid-' + uid_n++));
  };

  self.sendBadgesTo = function(backpack) {
    // Thimble-style always send all
    return SendToBackpackRequestGroup(backpack, self.issuedBadges);
  };

  return self;
}

should.Assertion.prototype.includeBadges = function(array) {
  array.length.should.be.above(0);
  array.forEach(function(item) {
    this.assert(
      ~this.obj.indexOfBadgeWithUrl(item), 
      function(){ return 'expected backpack to include badge with url ' + item },
      function(){ return 'expected backpack to not include badge with url ' + item }
    );
  }, this);
};

module.exports = fiberize(function() {
  this.Before(function(){
    this.site = new IssuerSite();
    this.backpack = new FakeBackpack(DEFAULT_EMAIL);
    badgehostApp = badgehost.app.build();
    var doneListening = new Future();
    badgehostApp.listen(function() {
      doneListening.return(this);
    });
    badgehostApp.server = doneListening.wait();
  });

  this.After(function(){
    badgehostApp.server.close();
  });
});
