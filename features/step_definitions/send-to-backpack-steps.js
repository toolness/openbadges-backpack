const should = require('should');

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

module.exports = require('../../test/lib/fiber-cucumber')(function() {
  this.Before(function(){
    this.site = new IssuerSite();
    this.backpack = [];
  });

  this.Given(/^I have earned (\d+) badges?$/, function(number) {
    this.badges = [];
    for (var i = 0; i < parseInt(number); i++)
      this.badges.push(this.site.issueBadge());
  });

  this.Given(/^(I have earned a badge|a pushy issuer gives me a useless spam badge)$/, function() {
    this.badges = [this.site.issueBadge()];
  });

  this.Given(/^I have a badge in my Backpack$/, function() {
    this.badges = [this.site.issueBadge()];
    this.site.sendBadgesTo(this.badges, this.backpack).acceptAll();
  });

  this.When(/^(?:I|they) (start sending|send) .* to my Backpack.*$/, function(sendType) {
    this.sending = this.site.sendBadgesTo(this.badges, this.backpack);
    if (sendType == "send")
      this.sending.acceptAll();
  });

  this.When(/^I reject it$/, function() {
    this.sending.rejectAll();
  });

  this.Then(/^I should see (?:my|the) badges? in my Backpack$/, function() {
    this.backpack.should.includeEach(this.badges);
  });

  this.Then(/^I should not see it in my Backpack$/, function() {
    this.backpack.should.not.includeEach(this.badges);
  });

  this.Then(/^I should see a notice that I already have that badge$/, function() {
    this.sending[0].result.should.equal("EXISTS");
  });
});
