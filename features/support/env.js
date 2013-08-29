var should = require('should');
var fiberize = require('../../test/lib/fiber-cucumber');
var testUtil = require('../../test/lib/util');
var SendToBackpackRequest = require('../../').SendToBackpackRequest;
var SendToBackpackRequestGroup = SendToBackpackRequest.Group;

var DEFAULT_EMAIL = "me@example.org";

function IssuerSite(badgehostApp) {
  var self = this;
 
  var uid_n = 1;

  self.loggedInUser = DEFAULT_EMAIL;
  self.issuedBadges = []; // NOTE: issued, not sent

  self.issueBadge = function() {
    var url = badgehostApp.badgeFor(self.loggedInUser, 'uid-' + uid_n++);
    self.issuedBadges.push(url);
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
    this.backpack = new testUtil.FakeBackpack(DEFAULT_EMAIL);
    this.badgehostApp = testUtil.BadgehostApp();
    this.site = new IssuerSite(this.badgehostApp);
  });

  this.After(function(){
    this.badgehostApp.server.close();
  });
});
