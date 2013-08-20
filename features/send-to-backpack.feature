Feature: Send to Backpack
  In order to export my badges to a common place where I can do 
  interesting things with them, As a badge earner on multiple different
  sites, I want those sites to offer me a Send to Backpack option.

  Scenario: Earned a badge and has a Backpack
    Given I have earned a badge
    When I send it to my Backpack
    Then I should see my badge in my Backpack

  Scenario: Reject sending an earned badge
    Given a pushy issuer gives me a useless spam badge
    When they start sending it to my Backpack
    And I reject it
    Then I should not see it in my Backpack

  Scenario: Sending a badge already in Backpack
    Given I have a badge in my Backpack
    When I start sending that badge to my Backpack again
    Then I should see a notice that I already have that badge
