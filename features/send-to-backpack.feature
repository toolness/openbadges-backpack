Feature: Send to Backpack
  In order to have my badges in a common place where I can do 
  interesting things with them, I want badge issuers to be able
  to send badges to my backpack--assuming I have given them permission
  to do so.

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

  Scenario: Earned multiple badges and has a Backpack
    Given I have earned 2 badges
    When I send them to my Backpack
    Then I should see the badges in my Backpack

  Scenario: Earned a badge with a different email address
    Given I am logged into my Backpack as play@example.org
    And I have earned a badge as work@example.org
    When I start sending it to my Backpack
    Then I should see a notice that the badge is for a different email
