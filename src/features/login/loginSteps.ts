import { Given, When, Then } from '@cucumber/cucumber';
import { DeviceService } from '../../services/DeviceService';

const platform = DeviceService.resolvePlatform();
// eslint-disable-next-line @typescript-eslint/no-var-requires
const LoginPage = require(platform === 'ios' ? '../../pages/ios/LoginPage' : '../../pages/android/LoginPage').LoginPage;
// eslint-disable-next-line @typescript-eslint/no-var-requires
const DashboardPage = require(platform === 'ios' ? '../../pages/ios/DashboardPage' : '../../pages/android/DashboardPage').DashboardPage;

const loginPage = new LoginPage();
const dashboardPage = new DashboardPage();
const testData = require('../../test-data/testData.json');

Given('the user is on the login screen', async function () {
  await loginPage.open();
});

When('the user enters valid credentials', async function () {
  const user = testData.qa.validUser;
  await loginPage.login(user);
});

Then('the dashboard should be visible', async function () {
  const visible = await dashboardPage.isDisplayed();
  if (!visible) {
    throw new Error('Dashboard was not displayed after login.');
  }
});
