import { After, Before, Given, Then } from '@cucumber/cucumber';
import { MyBankingAndroidWorld } from '../../support/world';

Before({ tags: '@abcbank' }, async function (this: MyBankingAndroidWorld) {
  await this.initialize();
});

After({ tags: '@abcbank' }, async function (this: MyBankingAndroidWorld) {
  await this.dispose();
});

Given('I launch ABCBank', async function (this: MyBankingAndroidWorld) {
  const ready = await this.waitForLoginScreen();
  if (!ready) {
    throw new Error('ABCBank login screen was not displayed.');
  }
});

Then('the ABCBank login screen should be displayed', async function (this: MyBankingAndroidWorld) {
  const visible = await this.waitForLoginScreen(5000);
  if (!visible) {
    throw new Error('ABCBank login screen was not displayed.');
  }
});