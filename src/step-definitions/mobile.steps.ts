import { Given, Then, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { MobileWorld } from '../support/world';
import { MobileLoginPage } from '../pages/MobileLoginPage';
import { MobileTransferPage } from '../pages/MobileTransferPage';
import { getParabankCredentials, mobileConfig } from '../../config';

Given('the customer opens the ParaBank mobile site', async function (this: MobileWorld) {
  await this.page.goto(mobileConfig.baseUrl, {
    waitUntil: 'domcontentloaded',
    timeout: 30000,
  });
});

Given('the customer signs in with valid mobile credentials', async function (this: MobileWorld) {
  const loginPage = new MobileLoginPage(this.page);
  const credentials = getParabankCredentials();
  await loginPage.login(credentials.username, credentials.password);
  await expect(this.page).toHaveURL(/overview\.htm/, { timeout: 20000 });
});

When('I navigate to the Transfer Funds page', async function (this: MobileWorld) {
  await this.page.getByRole('link', { name: 'Transfer Funds' }).click();
  await expect(this.page).toHaveURL(/transfer\.htm/, { timeout: 20000 });
});

When('I submit a transfer of {string} from {string} to {string}', async function (this: MobileWorld, amount: string, from: string, to: string) {
  const transfer = new MobileTransferPage(this.page);
  await transfer.fillTransfer(amount, from, to);
  await transfer.submit();
});

Then('the transfer completes and confirmation is visible without scrolling', async function (this: MobileWorld) {
  const confirmation = this.page.getByText('Transfer Complete').first();
  await expect(confirmation).toBeVisible();
  const box = await confirmation.boundingBox();
  expect(box).not.toBeNull();
  if (box) {
    const viewport = this.page.viewportSize() || { height: 1024 };
    expect(box.y + box.height).toBeLessThanOrEqual(viewport.height);
  }
});
