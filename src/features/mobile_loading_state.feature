@mobile @ID-M9 @loading-state
Feature: Mobile transfer loading state and duplicate-submit protection
  In order to prevent duplicate money transfers on mobile banking
  As a mobile user
  I want a visible loading state and a disabled confirm button while transfer submission is in flight

  Background:
    Given the customer opens the ParaBank mobile site
    And the customer signs in with valid mobile credentials

  Scenario: Loading state is shown and duplicate submit is blocked during slow network transfer
    Given the customer opens the mobile transfer flow for ID-M9
    When the customer enables CDP network throttling for the ID-M9 transfer
    And the customer prepares valid transfer details for ID-M9
    And the customer submits the ID-M9 transfer twice in rapid succession
    Then the customer sees a loading state while the ID-M9 transfer is in flight
    And the transfer confirmation control remains disabled while the ID-M9 transfer is in flight
    And exactly one ID-M9 transfer submission request is sent
    And the customer's ID-M9 transfer completes successfully