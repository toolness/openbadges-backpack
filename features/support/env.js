var should = require('should');

var fiberize = require('../../test/lib/fiber-cucumber');

function Badge() {
  var self = this;
  return self;
}

function SendToBackpackRequest(badge, backpack) {
  if (backpack.indexOf(badge) !== -1)
    return {result: "EXISTS"};
  return {
    accept: function() {
      backpack.push(badge);
    },
    reject: function() {}
  };
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
  
  self.issueBadge = function() {
    return new Badge();
  };

  self.sendBadgesTo = function(badges, backpack) {
    return SendToBackpackRequestGroup(badges, backpack);
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
    this.backpack = [];
  });
});
