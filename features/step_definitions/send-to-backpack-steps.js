const should = require('should');

function Badge() {
  var self = this;
  return self;
}

function IssuerSite() {
  var self = this;
  
  self.issueBadge = function() {
    return new Badge();
  };

  self.sendBadgeTo = function(badge, backpack) {
    if (backpack.indexOf(badge) !== -1)
      return { duplicate: true };
    return {
      accept: function() {
        backpack.push(badge);
      },
      reject: function() {}
    };
  };

  return self;
}

module.exports = require('../../test/lib/fiber-cucumber')(function() {
  this.Before(function(){
    this.site = new IssuerSite();
    this.backpack = [];
  });

  this.Given(/^I have earned a badge$/, function() {
    this.badge = this.site.issueBadge();
  });

  this.Given(/^I have a badge in my Backpack$/, function() {
    this.badge = this.site.issueBadge();
    this.site.sendBadgeTo(this.badge, this.backpack).accept();
  });

  this.When(/^I (start to )?send .* to my Backpack.*$/, function(startOnly) {
    this.sendToBackpackRequest = this.site.sendBadgeTo(this.badge, this.backpack);
    if (!startOnly)
      this.sendToBackpackRequest.accept();
  });

  this.When(/^a pushy Issuer starts sending a badge to my Backpack$/, function() {
    this.badge = this.site.issueBadge();
    this.sendToBackpackRequest = this.site.sendBadgeTo(this.badge, this.backpack);
  });

  this.When(/^I reject it$/, function() {
    this.sendToBackpackRequest.reject();
  });

  this.Then(/^I should see my badge in my Backpack$/, function() {
    this.backpack.should.include(this.badge);
  });

  this.Then(/^I should not see it in my Backpack$/, function() {
    this.backpack.should.not.include(this.badge);
  });

  this.Then(/^I should see a notice that I already have that badge$/, function() {
    this.sendToBackpackRequest.duplicate.should.be.true;
  });

});
