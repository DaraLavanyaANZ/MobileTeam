import { Page, expect } from '@playwright/test';
import mobileTestData from '../test-data/mobileTestData.json';

export type PaymentDraft = {
  payeeName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  phoneNumber: string;
  accountNumber: string;
  verifyAccount: string;
  amount: string;
  fromAccountId: string;
};

export class MobilePaymentRotationPage {
  private draft!: PaymentDraft;

  private readonly selectors = {
    billPayLink: 'a:has-text("Bill Pay")',
    payeeName: 'input[name="payee.name"]',
    street: 'input[name="payee.address.street"]',
    city: 'input[name="payee.address.city"]',
    state: 'input[name="payee.address.state"]',
    zipCode: 'input[name="payee.address.zipCode"]',
    phoneNumber: 'input[name="payee.phoneNumber"]',
    accountNumber: 'input[name="payee.accountNumber"]',
    verifyAccount: 'input[name="verifyAccount"]',
    amount: 'input[name="amount"]',
    fromAccount: 'select[name="fromAccountId"]',
    submit: 'input[value="Send Payment"]',
  } as const;

  constructor(private readonly page: Page) {}

  async openBillPayPage(): Promise<void> {
    await this.page.locator(this.selectors.billPayLink).click();

    await this.page.waitForURL(/billpay\.htm/, {
      timeout: 20000,
    });

    await this.page
      .locator(this.selectors.payeeName)
      .waitFor({
        state: 'visible',
        timeout: 20000,
      });
  }

  async createPaymentDraft(): Promise<void> {
    const fromAccountOptions =
      await this.page
        .locator('select[name="fromAccountId"] option')
        .evaluateAll(options =>
          options
            .map(
              option =>
                (option as HTMLOptionElement).value
            )
            .filter(Boolean)
        );

    const fromAccountId =
      fromAccountOptions[0] ||
      await this.page
        .locator('select[name="fromAccountId"]')
        .inputValue();

    this.draft = {
      ...mobileTestData.m8.paymentDraft,
      fromAccountId,
    };

    await this.fillDraft(this.draft);
  }

  private async fillDraft(
    draft: PaymentDraft
  ): Promise<void> {

    await this.page
      .locator(this.selectors.payeeName)
      .fill(draft.payeeName);

    await this.page
      .locator(this.selectors.street)
      .fill(draft.street);

    await this.page
      .locator(this.selectors.city)
      .fill(draft.city);

    await this.page
      .locator(this.selectors.state)
      .fill(draft.state);

    await this.page
      .locator(this.selectors.zipCode)
      .fill(draft.zipCode);

    await this.page
      .locator(this.selectors.phoneNumber)
      .fill(draft.phoneNumber);

    await this.page
      .locator(this.selectors.accountNumber)
      .fill(draft.accountNumber);

    await this.page
      .locator(this.selectors.verifyAccount)
      .fill(draft.verifyAccount);

    await this.page
      .locator(this.selectors.amount)
      .fill(draft.amount);

    await this.page
      .locator(this.selectors.fromAccount)
      .selectOption({
        value: draft.fromAccountId,
      });
  }

  async captureDraft(): Promise<PaymentDraft> {
    return {
      payeeName: await this.page.inputValue(this.selectors.payeeName),
      street: await this.page.inputValue(this.selectors.street),
      city: await this.page.inputValue(this.selectors.city),
      state: await this.page.inputValue(this.selectors.state),
      zipCode: await this.page.inputValue(this.selectors.zipCode),
      phoneNumber: await this.page.inputValue(this.selectors.phoneNumber),
      accountNumber: await this.page.inputValue(this.selectors.accountNumber),
      verifyAccount: await this.page.inputValue(this.selectors.verifyAccount),
      amount: await this.page.inputValue(this.selectors.amount),
      fromAccountId: await this.page.inputValue(this.selectors.fromAccount),
    };
  }

  async rotateToLandscape(): Promise<void> {
    await this.page.setViewportSize({
      width: 1024,
      height: 768,
    });

    await this.page.waitForFunction(
      () => window.innerWidth > window.innerHeight
    );
  }

  async rotateToPortrait(): Promise<void> {
    await this.page.setViewportSize({
      width: 390,
      height: 844,
    });

    await this.page.waitForFunction(
      () => window.innerHeight > window.innerWidth
    );
  }

  async validateDraftIntegrity(): Promise<void> {
    await expect
      .poll(() => this.captureDraft())
      .toEqual(this.draft);
  }

  async validateLandscapeLayout(): Promise<void> {
    const metrics = await this.layoutMetrics();

    expect(metrics.innerWidth)
      .toBeGreaterThan(metrics.innerHeight);

    expect(metrics.scrollWidth)
      .toBeLessThanOrEqual(metrics.innerWidth + 20);

    expect(metrics.scrollHeight)
      .toBeGreaterThan(0);
  }

  async validatePortraitLayout(): Promise<void> {
    const metrics = await this.layoutMetrics();

    expect(metrics.innerHeight)
      .toBeGreaterThan(metrics.innerWidth);

    expect(metrics.scrollWidth)
      .toBeLessThanOrEqual(metrics.innerWidth + 20);

    expect(metrics.scrollHeight)
      .toBeGreaterThan(0);
  }

  private async layoutMetrics() {
    return this.page.evaluate(() => ({
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
      scrollWidth: document.documentElement.scrollWidth,
      scrollHeight: document.documentElement.scrollHeight,
    }));
  }

  async submitPayment(): Promise<void> {
    await this.page
      .locator(this.selectors.submit)
      .click();

    await this.page
      .locator('body')
      .filter({
        hasText: /complete|successfully|payment/i,
      })
      .waitFor({
        state: 'visible',
        timeout: 30000,
      });
  }

  async validatePaymentSuccess(): Promise<void> {
    await expect(
      this.page.locator('body')
    ).toContainText(
      /complete|successfully|payment/i
    );
  }
}