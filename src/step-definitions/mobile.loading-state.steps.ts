import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { MobileWorld } from '../support/world';
import { MobileLoadingStatePage } from '../pages/MobileLoadingStatePage';

let pageModel: MobileLoadingStatePage;

Given(
  'the customer opens the mobile transfer flow for ID-M9',
  async function (this: MobileWorld) {
    pageModel = new MobileLoadingStatePage(
      this.page,
      this.context
    );

    await pageModel.openTransferScreen();
  }
);

When(
  'the customer enables CDP network throttling for the ID-M9 transfer',
  async function () {
    await pageModel.enableNetworkThrottling();
  }
);

When(
  'the customer prepares valid transfer details for ID-M9',
  async function () {
    await pageModel.prepareValidTransfer();
  }
);

When(
  'the customer submits the ID-M9 transfer twice in rapid succession',
  async function () {
    await pageModel.submitTransferTwice();
  }
);

Then(
  'the customer sees a loading state while the ID-M9 transfer is in flight',
  async function () {
    expect(
      pageModel.didShowLoadingState()
    ).toBe(true);
  }
);

Then(
  'the transfer confirmation control remains disabled while the ID-M9 transfer is in flight',
  async function () {
    expect(
      pageModel.didDisableSubmitButton()
    ).toBe(true);
  }
);

Then(
  'exactly one ID-M9 transfer submission request is sent',
  async function () {
    await pageModel.waitForRequestsToComplete();

    expect(
      pageModel.getTransferCount()
    ).toBe(1);
  }
);

Then(
  "the customer's ID-M9 transfer completes successfully",
  { timeout: 90000 },
  async function () {

    await pageModel.restoreNetwork();

    await pageModel.waitForRequestsToComplete();

    await pageModel.validateTransferSuccess();

    expect(
      pageModel.getTransferCount()
    ).toBeGreaterThan(0);

    expect(
      pageModel.getAmount().length
    ).toBeGreaterThan(0);
  }
);