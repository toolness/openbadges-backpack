Feature: Send to Backpack
  In order to export my badges to a common place where I can do 
  interesting things with them, As a badge earner on multiple different
  sites, I want those sites to offer me a Send to Backpack option.

  Scenario: Earned a badge and has a Backpack
    Given I have earned a badge as some@email.org
    When I click the **Add to Backpack** button
    And I log in to my Backpack as some@email.org
    And I accept all conditions/prompts presented to me
    Then I should see my badge in my Backpack
