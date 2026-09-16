import { Page } from '@playwright/test';

export class MobileTransferPage {
  constructor(private readonly page: Page) {}

  async fillTransfer(amount: string, fromAccountId: string, toAccountId: string): Promise<void> {
    await this.page.locator('#amount').fill(amount);
    await this.page.locator('select[name="fromAccountId"]').selectOption({ value: fromAccountId });
    await this.page.locator('select[name="toAccountId"]').selectOption({ value: toAccountId });
  }

  async submit(): Promise<void> {
    await this.page.locator('input[value="Transfer"]').click();
  }
}
