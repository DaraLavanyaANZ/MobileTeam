import { When, Then } from '@cucumber/cucumber';
import { MobileWorld } from '../support/world';
import { MobilePaymentRotationPage } from '../pages/MobilePaymentRotationPage';

let pageModel: MobilePaymentRotationPage;

When(
  'the customer opens the mobile Bill Pay form for rotation validation',
  async function (this: MobileWorld) {

    pageModel = new MobilePaymentRotationPage(
      this.page
    );

    await pageModel.openBillPayPage();
  }
);

When(
  'the customer creates a mobile payment draft',
  async function () {

    await pageModel.createPaymentDraft();
  }
);

When(
  'the customer rotates the payment form to landscape',
  async function () {

    await pageModel.rotateToLandscape();
  }
);

When(
  'the customer rotates the payment form back to portrait',
  async function () {

    await pageModel.rotateToPortrait();
  }
);

Then(
  "the customer's payment draft remains intact in landscape",
  async function () {

    await pageModel.validateDraftIntegrity();
  }
);

Then(
  'the payment layout remains stable in landscape',
  async function () {

    await pageModel.validateLandscapeLayout();
  }
);

Then(
  "the customer's payment draft remains intact in portrait",
  async function () {

    await pageModel.validateDraftIntegrity();
  }
);

Then(
  'the payment layout remains stable in portrait',
  async function () {

    await pageModel.validatePortraitLayout();
  }
);

When(
  'the customer submits the rotated mobile payment draft',
  async function () {

    await pageModel.submitPayment();
  }
);

Then(
  "the customer's mobile payment completes successfully",
  async function () {

    await pageModel.validatePaymentSuccess();
  }
);