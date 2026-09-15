@smoke @critical
Feature: User authentication

  Scenario: User logs in with valid credentials
    Given the user is on the login screen
    When the user enters valid credentials
    Then the dashboard should be visible
