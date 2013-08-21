var fiberize = require('../../test/lib/fiber-cucumber');

module.exports = fiberize(function() {
  this.Given(/^I am logged into my Backpack as (.+)$/, function(email) {
    this.backpack.loggedInUser = email;
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
    this.sending = this.site.sendBadgesTo(this.backpack);
    if (sendType == "send")
      this.sending.acceptAll();
  });

  this.When(/^I reject it$/, function() {
    this.sending.rejectAll();
  });

  this.Then(/^I should see (?:my|the) badges? in my Backpack$/, function() {
    this.backpack.should.includeEach(this.site.issuedBadges);
  });

  this.Then(/^I should not see it in my Backpack$/, function() {
    this.backpack.should.not.includeEach(this.site.issuedBadges);
  });

  this.Then(/^I should see a notice that I already have that badge$/, function() {
    this.sending[0].result.should.equal("EXISTS");
  });

  this.Then(/^I should see a notice that the badge is for a different email$/, function() {
    this.sending[0].result.should.equal("RECIPIENT_MISMATCH");
  });
});
