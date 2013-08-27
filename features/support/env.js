var should = require('should');

var fiberize = require('../../test/lib/fiber-cucumber');

var DEFAULT_EMAIL = "me@example.org";

function Backpack() {
  var self = [];

  self.owner = DEFAULT_EMAIL;

  return self;
}

function Badge(options) {
  var self = this;

  self.recipient = options.recipient;

  return self;
}

function SendToBackpackRequest(badge, backpack) {
  var self = {result: null};

  self.accept = function() {
    should.equal(self.result, null);
    backpack.push(badge);
    self.result = "accepted";
  };

  self.reject = function() {
    should.equal(self.result, null);
    self.result = "rejected";
  };

  if (backpack.owner != badge.recipient)
    self.result = "recipient_mismatch";

  if (backpack.indexOf(badge) !== -1)
    self.result = "exists";

  return self;
}

function SendToBackpackRequestGroup(badges, backpack) {
  var self = new Array();

  badges.forEach(function(badge) {
    self.push(SendToBackpackRequest(badge, backpack));
  });

  self.acceptAll = function() {
    self.forEach(function(request) { request.accept(); });
  };

  self.rejectAll = function() {
     self.forEach(function(request) { request.reject(); });
  };

  return self;
}

function IssuerSite() {
  var self = this;
  
  self.loggedInUser = DEFAULT_EMAIL;
  self.issuedBadges = [];

  self.issueBadge = function() {
    self.issuedBadges.push(new Badge({recipient: self.loggedInUser}));
  };

  self.sendBadgesTo = function(backpack) {
    return SendToBackpackRequestGroup(self.issuedBadges, backpack);
  };

  return self;
}

should.Assertion.prototype.includeEach = function(array) {
  array.forEach(function(item) {
    this.include(item);
  }, this);
};

module.exports = fiberize(function() {
  this.Before(function(){
    this.site = new IssuerSite();
    this.backpack = new Backpack();
  });
});
