var fiberize = require('../../test/lib/fiber-cucumber');
var should = require('should');

module.exports = fiberize(function() {
  this.Given(/^I am logged into my Backpack as (.+)$/, function(email) {
    this.backpack.owner = email;
  });

  this.Given(/^I have earned (\d+) badges?$/, function(number) {
    for (var i = 0; i < parseInt(number); i++)
      this.site.issueBadge();
  });

  this.Given(/^I have earned a badge as (.+)$/, function(email) {
    this.site.loggedInUser = email;
    this.site.issueBadge();
  });

  this.Given(/^(I have earned a badge|a pushy issuer gives me a useless spam badge)$/, function() {
    this.site.issueBadge();
  });

  this.Given(/^I have a badge in my Backpack$/, function() {
    this.site.issueBadge();
    this.site.sendBadgesTo(this.backpack).acceptAll();
  });

  this.When(/^(?:I|they) (start sending|send) .* to my Backpack.*$/, function(sendType) {
    this.sendGroup = this.site.sendBadgesTo(this.backpack);
    if (sendType == "send") {
      this.sendGroup.forEach(function(request) {
        should.equal(request.result, null);
        request.canBeAccepted.should.equal(true); 
      });
      this.sendGroup.acceptAll();
    }
  });

  this.When(/^I reject it$/, function() {
    this.sendGroup.rejectAll();
  });

  this.Then(/^I should see (?:my|the) badges? in my Backpack$/, function() {
    this.sendGroup[0].result.should.equal("accepted");
    this.backpack.should.includeBadges(this.site.issuedBadges);
  });

  this.Then(/^I should not see it in my Backpack$/, function() {
    this.backpack.should.not.includeBadges(this.site.issuedBadges);
  });

  this.Then(/^I should see a notice that I already have that badge$/, function() {
    this.sendGroup[0].result.should.equal("exists");
  });

  this.Then(/^I should see a notice that the badge is for a different email$/, function() {
    this.sendGroup[0].result.should.equal("recipient_mismatch");
  });
});
