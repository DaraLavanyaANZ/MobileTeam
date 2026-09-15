@android @abcbank @critical
Feature: ABCBank native Android flow
  In order to verify the native ABCBank app on an Android emulator
  As a mobile banking user
  I want to launch the app and reach the login screen

  Scenario: Launch ABCBank and show the login screen
    Given I launch ABCBank
    Then the ABCBank login screen should be displayed