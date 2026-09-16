import { Given, Then, When } from '@cucumber/cucumber';
import { MobileTransactionsPage } from '../pages/MobileTransactionsPage';
import { MobileWorld } from '../support/world';

let pageModel: MobileTransactionsPage;

Given(
  'the customer opens the mobile transaction history for ID-M7',
  async function (this: MobileWorld) {

    pageModel =
      new MobileTransactionsPage(
        this.page
      );

    await pageModel.openTransactionHistory();
  }
);

When(
  'the customer captures the initial transaction history snapshot',
  async function () {

    await pageModel.captureInitialSnapshot();
  }
);

When(
  'the customer creates {int} additional transfer transactions for the active mobile account',
  async function (count: number) {

    await pageModel.createTransferTransactions(
      count
    );
  }
);

When(
  'the customer opens the updated account activity from Accounts Overview',
  async function () {

    await pageModel.openUpdatedActivity();
  }
);

When(
  'the customer scrolls through the mobile account activity list',
  async function () {

    await pageModel.scrollTransactionList();
  }
);

When(
  'the customer refreshes the mobile transaction history',
  async function () {

    await pageModel.refreshTransactionHistory();
  }
);

Then(
  'the transaction history grows after lazy loading',
  async function () {

    await pageModel.validateHistoryGrowth();
  }
);

Then(
  'the transaction history contains no duplicate entries after lazy loading',
  async function () {

    await pageModel.validateNoDuplicateTransactions();
  }
);

Then(
  'the refreshed transaction history resets and remains consistent',
  async function () {

    await pageModel.validateRefreshConsistency();
  }
);