@mobile @ID-M7 @transaction-list
Feature: Mobile banking transaction list behavior
  In order to verify transaction browsing quality on mobile banking
  As a mobile user
  I want additional transaction loads and refresh to behave correctly without duplicate rows

  Scenario: Additional transaction loads do not duplicate transactions
    Given the customer opens the mobile transaction history for ID-M7
    And the customer captures the initial transaction history snapshot
    When the customer creates 4 additional transfer transactions for the active mobile account
    And the customer opens the updated account activity from Accounts Overview
    And the customer scrolls through the mobile account activity list
    Then the transaction history grows after lazy loading
    And the transaction history contains no duplicate entries after lazy loading

  Scenario: Refresh reloads transaction list correctly on mobile
    Given the customer opens the mobile transaction history for ID-M7
    And the customer captures the initial transaction history snapshot
    When the customer creates 2 additional transfer transactions for the active mobile account
    And the customer opens the updated account activity from Accounts Overview
    And the customer scrolls through the mobile account activity list
    And the customer refreshes the mobile transaction history
    Then the refreshed transaction history resets and remains consistent