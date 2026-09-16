import { Given, Then, When } from '@cucumber/cucumber';
import { MobileWorld } from '../support/world';
import { MobileOfflineReconnectPage } from '../pages/MobileOfflineReconnectPage';

let pageModel: MobileOfflineReconnectPage;

Given(
  'the customer opens ParaBank mobile and signs in for ID-M10',
  async function (this: MobileWorld) {

    pageModel =
      new MobileOfflineReconnectPage(
        this.page,
        this.context
      );

    await pageModel.openAndLogin();
  }
);

Given(
  'the customer opens the ID-M10 transfer page',
  async function () {

    await pageModel.openTransferPage();
  }
);

Given(
  'the customer prepares valid ID-M10 transfer details',
  async function () {

    await pageModel.prepareTransferDetails();
  }
);

When(
  'the customer starts the ID-M10 transfer and immediately goes offline',
  async function () {

    await pageModel.startTransferAndGoOffline();
  }
);

Then(
  'the customer sees a clear offline message for ID-M10',
  async function () {

    await pageModel.verifyOfflineMessage();
  }
);

When(
  'the customer reconnects and retries the ID-M10 transfer once',
  async function () {

    await pageModel.reconnectAndRetryTransfer();
  }
);

Then(
  'reconnecting does not create a duplicate debit for ID-M10',
  async function () {

    await pageModel.verifyNoDuplicateDebit();
  }
);