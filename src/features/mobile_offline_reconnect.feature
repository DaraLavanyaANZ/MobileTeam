@mobile @ID-M10 @offline-reconnect
Feature: Mobile transfer behavior during offline and reconnect
  In order to protect users during unstable network conditions
  As a mobile banking user
  I want a clear offline message and safe recovery without duplicate debit

  Scenario: Going offline mid-payment shows clear feedback and reconnect creates no duplicate debit
    Given the customer opens ParaBank mobile and signs in for ID-M10
    And the customer opens the ID-M10 transfer page
    And the customer prepares valid ID-M10 transfer details
    When the customer starts the ID-M10 transfer and immediately goes offline
    Then the customer sees a clear offline message for ID-M10
    When the customer reconnects and retries the ID-M10 transfer once
    Then reconnecting does not create a duplicate debit for ID-M10