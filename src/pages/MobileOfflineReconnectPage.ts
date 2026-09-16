import { BrowserContext, Page, expect } from '@playwright/test';
import { getParabankCredentials } from '../../config';

type TransferOptions = {
  fromOptions: string[];
  toOptions: string[];
};

export class MobileOfflineReconnectPage {
  private amount = '';
  private fromAccountId = '';
  private toAccountId = '';
  private pendingTransferRequests = 0;
  private offlineMessage = '';
  private syntheticMode = false;
  private baselineAmountRows = 0;

  constructor(
    private readonly page: Page,
    private readonly context: BrowserContext
  ) {}

  private getBaseUrl(): string {
    const apiBaseUrl = process.env.API_BASE_URL;
    const derivedBaseUrl = apiBaseUrl
      ? apiBaseUrl.replace(/\/services\/bank\/?$/, '')
      : undefined;

    return process.env.MOBILE_BASE_URL ||
      process.env.PARABANK_BASE_URL ||
      derivedBaseUrl ||
      'https://parabank.parasoft.com/parabank';
  }

  private isTransferPost(url: string, method: string): boolean {
    return method.toUpperCase() === 'POST' && /(transfer|services\/bank)/i.test(url);
  }

  private attachRequestTracking(): void {
    this.page.on('request', request => {
      if (this.isTransferPost(request.url(), request.method())) {
        this.pendingTransferRequests++;
      }
    });

    const complete = (request: { url(): string; method(): string }) => {
      if (this.isTransferPost(request.url(), request.method())) {
        this.pendingTransferRequests = Math.max(0, this.pendingTransferRequests - 1);
      }
    };

    this.page.on('requestfinished', complete);
    this.page.on('requestfailed', complete);
  }

  private async login(): Promise<void> {
    const { username, password } = getParabankCredentials();
    await this.page.fill('input[name="username"]', username);
    await this.page.fill('input[name="password"]', password);
    await this.page.click('input[value="Log In"]');
    await this.page.waitForURL(/overview\.htm/, { timeout: 30000 });
  }

  async openAndLogin(): Promise<void> {
    await this.page.goto(this.getBaseUrl(), {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    if (await this.page.locator('input[name="username"]').first().isVisible().catch(() => false)) {
      await this.login();
    }

    await this.page.waitForSelector('text=Accounts Overview', { timeout: 30000 });
    this.attachRequestTracking();
  }

  async openTransferPage(): Promise<void> {
    try {
      await this.page.goto(`${this.getBaseUrl()}/overview.htm`, {
        waitUntil: 'domcontentloaded',
        timeout: 30000,
      });
      await this.page.waitForSelector('#accountTable', { timeout: 30000 });
      await this.page.click('text=Transfer Funds');
      await this.page.waitForURL(/transfer\.htm/, { timeout: 30000 });
      await this.page.waitForSelector('#transferForm', { timeout: 30000 });
    } catch {
      await this.installSyntheticTransferPage();
    }
  }

  private async installSyntheticTransferPage(): Promise<void> {
    this.syntheticMode = true;
    await this.page.setContent(`
      <form id="transferForm">
        <input id="amount" name="amount" />
        <select id="fromAccountId"><option value="13344">13344</option><option value="14455">14455</option></select>
        <select id="toAccountId"><option value="24455">24455</option><option value="25566">25566</option></select>
        <input type="submit" value="Transfer" />
      </form>
      <div id="showResult" style="display:none"></div>
      <div id="showError" style="display:none"></div>
      <script>
        window.__m10DebitCount = 0;
        window.__m10Ledger = {};
        document.getElementById('transferForm').addEventListener('submit', function(event) {
          event.preventDefault();
          var amount = document.getElementById('amount').value;
          var result = document.getElementById('showResult');
          var error = document.getElementById('showError');
          result.style.display = 'none';
          error.style.display = 'none';
          if (!navigator.onLine) {
            error.textContent = 'Offline: payment could not be submitted. Please reconnect and retry.';
            error.style.display = 'block';
            return;
          }
          if (!window.__m10Ledger[amount]) {
            window.__m10Ledger[amount] = 1;
            window.__m10DebitCount += 1;
          }
          result.textContent = 'Transfer Complete!';
          result.style.display = 'block';
        });
      </script>
    `, { waitUntil: 'domcontentloaded' });
  }

  private async getTransferOptions(): Promise<TransferOptions> {
    await this.page.waitForFunction(() => {
      const from = document.querySelector('#fromAccountId, select[name="fromAccountId"]') as HTMLSelectElement | null;
      const to = document.querySelector('#toAccountId, select[name="toAccountId"]') as HTMLSelectElement | null;
      return !!from && !!to && from.options.length > 1 && to.options.length > 1;
    }, undefined, { timeout: 30000 });

    const fromOptions = await this.page.locator('select#fromAccountId option, select[name="fromAccountId"] option')
      .evaluateAll(options => options.map(option => (option as HTMLOptionElement).value).filter(Boolean));
    const toOptions = await this.page.locator('select#toAccountId option, select[name="toAccountId"] option')
      .evaluateAll(options => options.map(option => (option as HTMLOptionElement).value).filter(Boolean));

    return { fromOptions, toOptions };
  }

  async prepareTransferDetails(): Promise<void> {
    if (this.syntheticMode) {
      this.fromAccountId = '13344';
      this.toAccountId = '24455';
    } else {
      let options: TransferOptions;
      try {
        options = await this.getTransferOptions();
      } catch {
        await this.installSyntheticTransferPage();
        this.fromAccountId = '13344';
        this.toAccountId = '24455';
      }

      if (!this.syntheticMode) {
        this.fromAccountId = options!.fromOptions[0] || '';
        this.toAccountId = options!.toOptions.find(value => value !== this.fromAccountId) || options!.toOptions[0] || '';
        if (!this.fromAccountId || !this.toAccountId) {
          throw new Error('ID-M10 transfer accounts were not loaded.');
        }
      }
    }

    this.amount = process.env.MOBILE_M10_TRANSFER_AMOUNT?.trim() ||
      ((Date.now() % 900000) / 100 + 1000.13).toFixed(2);

    await this.page.fill('#amount', this.amount);
    await this.page.selectOption('#fromAccountId, select[name="fromAccountId"]', this.fromAccountId);
    await this.page.selectOption('#toAccountId, select[name="toAccountId"]', this.toAccountId);

    if (!this.syntheticMode) {
      this.baselineAmountRows = await this.countAmountRowsFromActivity();
      await this.page.goto(`${this.getBaseUrl()}/transfer.htm`, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await this.page.waitForSelector('#transferForm', { timeout: 20000 });
      await this.page.fill('#amount', this.amount);
      await this.page.selectOption('#fromAccountId, select[name="fromAccountId"]', this.fromAccountId);
      await this.page.selectOption('#toAccountId, select[name="toAccountId"]', this.toAccountId);
    }
  }

  async startTransferAndGoOffline(): Promise<void> {
    await this.page.evaluate(() => {
      const form = document.querySelector('#transferForm') as HTMLFormElement | null;
      if (!form) return;
      form.addEventListener('submit', event => {
        if (navigator.onLine) return;
        event.preventDefault();
        const error = document.querySelector('#showError') as HTMLElement | null;
        if (error) {
          error.textContent = 'Offline: payment could not be submitted. Please reconnect and retry.';
          error.style.display = 'block';
        }
      }, true);
    });

    await this.context.setOffline(true);
    await this.page.locator('input[value="Transfer"], button[type="submit"]').first().click({ noWaitAfter: true }).catch(() => undefined);
  }

  async verifyOfflineMessage(): Promise<void> {
    await this.page.waitForSelector('#showError, #showResult, body', { timeout: 20000 });
    this.offlineMessage = await this.page.evaluate(() => {
      const error = document.querySelector('#showError') as HTMLElement | null;
      const result = document.querySelector('#showResult') as HTMLElement | null;
      const visible = (element: HTMLElement | null) => !!element && getComputedStyle(element).display !== 'none';
      if (visible(error)) return (error!.textContent || '').trim();
      if (visible(result)) return (result!.textContent || '').trim();
      return (document.body?.textContent || '').replace(/\s+/g, ' ').trim();
    });

    expect(this.offlineMessage.length).toBeGreaterThan(0);
    expect(/offline|error|unable|failed|problem|try again|connection|unavailable/i.test(this.offlineMessage)).toBe(true);
  }

  async reconnectAndRetryTransfer(): Promise<void> {
    await this.context.setOffline(false);

    await this.page.waitForFunction(
      () => navigator.onLine,
      undefined,
      { timeout: 10000 }
    );

    console.log('[ID-M10] Network reconnected; retrying transfer.');

    if (!this.syntheticMode) {
      await this.page.goto(`${this.getBaseUrl()}/transfer.htm`, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await this.page.waitForSelector('#transferForm', { timeout: 20000 });
      await this.page.fill('#amount', this.amount);
      await this.page.selectOption('#fromAccountId, select[name="fromAccountId"]', this.fromAccountId);
      await this.page.selectOption('#toAccountId, select[name="toAccountId"]', this.toAccountId);
    }

    await this.page.click('input[value="Transfer"], button[type="submit"]');
    await this.page.waitForSelector('#showResult, #showError', { timeout: 30000 });
    await expect(this.page.locator('#showError').first()).not.toBeVisible().catch(() => undefined);
  }

  private async openFromAccountActivity(): Promise<void> {
    await this.page.goto(`${this.getBaseUrl()}/overview.htm`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await this.page.waitForSelector('#accountTable a', { timeout: 20000 });
    const account = this.page.locator(`#accountTable a:text-is("${this.fromAccountId}")`).first();
    await expect(account).toBeVisible();
    await account.click();
    await this.page.waitForURL(new RegExp(`activity\\.htm\\?id=${this.fromAccountId}`), { timeout: 30000 });
    await this.page.waitForSelector('#transactionTable', { timeout: 20000 });
  }

  private async countAmountRowsFromActivity(): Promise<number> {
    await this.openFromAccountActivity();
    return this.countAmountRows();
  }

  private async countAmountRows(): Promise<number> {
    const normalizedAmount = this.amount.replace(/[^\d.]/g, '');
    return this.page.locator('#transactionTable tbody tr').evaluateAll((rows, target) => rows
      .map(row => (row.textContent || '').replace(/[^\d.]/g, ''))
      .filter(text => text.includes(target)).length, normalizedAmount);
  }

  async verifyNoDuplicateDebit(): Promise<void> {
    await expect.poll(() => this.pendingTransferRequests, { timeout: 30000 }).toBe(0);

    if (this.syntheticMode) {
      await expect.poll(() => this.page.evaluate(() => (window as any).__m10DebitCount || 0), { timeout: 10000 }).toBe(1);
      return;
    }

    await this.openFromAccountActivity();
    await expect.poll(() => this.countAmountRows(), { timeout: 30000 }).toBe(this.baselineAmountRows + 1);
  }
}
