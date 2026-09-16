import { Given, Then, When } from '@cucumber/cucumber';
import { MobileWorld } from '../support/world';
import { MobileTouchTargetPage } from '../pages/MobileTouchTargetPage';

let pageModel: MobileTouchTargetPage;

Given(
  'the customer opens the mobile banking touch-target screen {string}',
  async function (this: MobileWorld, screen: string) {
    pageModel = new MobileTouchTargetPage(this.page);
    await pageModel.openTouchTargetScreen(screen);
  },
);

When(
  'the framework measures every interactive touch target on the screen',
  async function () {
    await pageModel.measureTouchTargets();
  },
);

Then(
  'each interactive element meets the minimum touch target size',
  async function () {
    await pageModel.validateTouchTargetSize();
  },
);

Then(
  'interactive elements have adequate spacing',
  async function () {
    await pageModel.validateSpacing();
  },
);