var should = require('should');

var fiberize = require('../../test/lib/fiber-cucumber');

var DEFAULT_EMAIL = "me@example.org";

function Backpack() {
  var self = [];

  self.loggedInUser = DEFAULT_EMAIL;

  return self;
}

function Badge(options) {
  var self = this;

  self.recipient = options.recipient;

  return self;
}

function SendToBackpackRequest(badge, backpack) {
  var self = {result: "PENDING"};

  self.accept = function() {
    self.result.should.equal("PENDING");
    backpack.push(badge);
    self.result = "ACCEPTED";
  };

  self.reject = function() {
    self.result.should.equal("PENDING");
    self.result = "REJECTED";
  };

  if (backpack.loggedInUser != badge.recipient)
    self.result = "RECIPIENT_MISMATCH";

  if (backpack.indexOf(badge) !== -1)
    self.result = "EXISTS";

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
