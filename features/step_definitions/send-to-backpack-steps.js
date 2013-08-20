module.exports = require('../../test/lib/fiber-cucumber')(function() {
  this.Given(/^I have earned a badge as (.+)$/, function(email) {
    this.pending();
  });

  this.When(/^I click the \*\*Add to Backpack\*\* button$/, function() {
    this.pending();
  });

  this.When(/^I log in to my Backpack as (.+)$/, function(email) {
    this.pending();
  });

  this.When(/^I accept all conditions\/prompts presented to me$/, function() {
    this.pending();
  });

  this.Then(/^I should see my badge in my Backpack$/, function() {
    this.pending();
  });
});
