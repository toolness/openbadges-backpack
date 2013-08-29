var should = require('should');
var badgehost = require('badgehost');
var validator = require('openbadges-validator');
var fiberize = require('../../test/lib/fiber-cucumber');
var Future = require('fibers/future');
var fibrous = require('../../').fibrous;
var SendToBackpackRequest = require('../../').SendToBackpackRequest;
var SendToBackpackRequestGroup = SendToBackpackRequest.Group;

var badgehostApp;

var DEFAULT_EMAIL = "me@example.org";

var FakeBackpack = function(owner) {
  var self = [];

  self.owner = owner;

  self.has = fibrous(function(options, cb) {
    if (typeof(options) == 'string') options = {guid: options};
    if (options.guid)
      return cb(null, self.indexOf(options.guid) != -1);
    validator.getAssertionGUID(options.urlOrSignature, function(err, guid) {
      if (err) return cb(err);
      return self.has({guid: guid}, cb);
    });
  });

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
  var backpack = this.obj;

  array.length.should.be.above(0);
  array.forEach(function(item) {
    this.assert(
      backpack.has({urlOrSignature: item}), 
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
