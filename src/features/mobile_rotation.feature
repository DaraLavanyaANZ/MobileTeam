@mobile @ID-M8 @rotation
Feature: Mobile payment rotation behavior
  In order to verify payment continuity on mobile
  As a mobile user
  I want rotating to landscape during a payment to keep state and layout stable

  Background:
    Given the customer opens the ParaBank mobile site
    And the customer signs in with valid mobile credentials

  Scenario: Rotating a payment draft to landscape keeps state and layout intact
    When the customer opens the mobile Bill Pay form for rotation validation
    And the customer creates a mobile payment draft
    And the customer rotates the payment form to landscape
    Then the customer's payment draft remains intact in landscape
    And the payment layout remains stable in landscape

  Scenario: Rotating from landscape back to portrait keeps state and allows payment submission
    When the customer opens the mobile Bill Pay form for rotation validation
    And the customer creates a mobile payment draft
    And the customer rotates the payment form to landscape
    And the customer rotates the payment form back to portrait
    Then the customer's payment draft remains intact in portrait
    And the payment layout remains stable in portrait
    When the customer submits the rotated mobile payment draft
    Then the customer's mobile payment completes successfully