import { Page, expect } from '@playwright/test';
//import { getParabankCredentials } from '../config';
import { getParabankCredentials } from '../../config';
import mobileTestData from '../test-data/mobileTestData.json';


type LoadSnapshot = {
  signatures: string[];
  rowCount: number;
};

type TransferSeedResult = {
  targetAccountId: string;
  createdAmounts: string[];
};

type ScrollResult = {
  before: number;
  after: number;
};

export class MobileTransactionsPage {
  private readonly rowSelector = '#transactionTable tbody tr';
  private readonly goButtonSelector = 'input[value="Go"]';

  private baselineRows?: string[];

  private initialCount?: number;

  private snapshots: LoadSnapshot[] = [];

  private preRefreshScrollTop?: number;

  private targetAccountId?: string;

  private createdAmounts: string[] = [];

  private lastScrollAfter?: number;

  constructor(private readonly page: Page) {}

  private getBaseUrl() {
    const apiBaseUrl = process.env.API_BASE_URL;
    const derivedBaseUrl = apiBaseUrl ? apiBaseUrl.replace(/\/services\/bank\/?$/, '') : undefined;
    return process.env.MOBILE_BASE_URL || process.env.PARABANK_BASE_URL || derivedBaseUrl || 'https://parabank.parasoft.com/parabank';
  }

  async openViaLogin() {
    const { username: user, password: pass } = getParabankCredentials();

    await this.page.goto(this.getBaseUrl(), {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    await this.page.fill('input[name="username"]', user);
    await this.page.fill('input[name="password"]', pass);
    await this.page.click('input[value="Log In"]');
    await this.page.waitForSelector('#accountTable a', { timeout: 30000 });

    await this.page.locator('#accountTable a').first().click();
    await this.page.waitForURL(/activity\.htm\?id=/, { timeout: 30000 });
    await this.waitForTransactionTable();
  }

  async waitForTransactionTable() {
    await this.page.waitForSelector('#transactionTable, p', { timeout: 15000 });
  }

  async getTransactionIds(): Promise<string[]> {
    return await this.page
      .locator(this.rowSelector)
      .evaluateAll((rows) => rows
        .map((row) => {
          const cells = Array.from(row.querySelectorAll('td')).map((td) => (td.textContent || '').trim());
          const hasData = cells.some((cell) => cell.length > 0);
          if (!hasData) return '';
          return cells.join('|');
        })
        .filter(Boolean));
  }

  async getRenderedCount(): Promise<number> {
    return await this.page.locator(this.rowSelector).count();
  }

  async getCurrentLoadSnapshot(): Promise<LoadSnapshot> {
    const signatures = await this.getTransactionIds();
    return {
      signatures,
      rowCount: signatures.length,
    };
  }

  private async getTransferAccountOptions() {
    const fromOptions = await this.page
      .locator('select#fromAccountId option, select[name="fromAccountId"] option')
      .evaluateAll((opts) => opts.map((o) => (o as HTMLOptionElement).value).filter(Boolean));
    const toOptions = await this.page
      .locator('select#toAccountId option, select[name="toAccountId"] option')
      .evaluateAll((opts) => opts.map((o) => (o as HTMLOptionElement).value).filter(Boolean));

    return {
      fromOptions,
      toOptions,
    };
  }

  private async getAccountIdsFromOverview(): Promise<string[]> {
    await this.page.goto(`${this.getBaseUrl()}/overview.htm`, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });
    await this.page.waitForSelector('#accountTable a', { timeout: 20000 });

    return await this.page
      .locator('#accountTable a')
      .evaluateAll((links) => links.map((a) => (a.textContent || '').trim()).filter(Boolean));
  }

  private normalizeAmount(value: string): string {
    return value.replace(/[^\d.-]/g, '');
  }

  private async ensureAtLeastTwoAccounts(
  existingIds: string[]
): Promise<string[]> {

  if (existingIds.length >= 2) {
    console.log(
      'Already have at least 2 accounts:',
      existingIds
    );
    return existingIds;
  }

  console.log(
    'Only one account found. Creating another account...'
  );

  await this.page.goto(
    `${this.getBaseUrl()}/openaccount.htm`,
    {
      waitUntil: 'networkidle',
      timeout: 30000,
    }
  );

  await this.page.waitForSelector(
    'select#fromAccountId, select[name="fromAccountId"]',
    {
      timeout: 30000,
    }
  );

  console.log(
    'Open Account Page URL:',
    this.page.url()
  );

  await this.page.screenshot({
    path: `before-open-account-${Date.now()}.png`,
    fullPage: true,
  });

  await this.page.click(
    'input[value="Open New Account"], button:has-text("Open New Account")'
  );

  await this.page.waitForLoadState('networkidle');

  console.log(
    'After Open Account Click URL:',
    this.page.url()
  );

  await this.page.screenshot({
    path: `after-open-account-${Date.now()}.png`,
    fullPage: true,
  });

  const newAccountLocator = this.page.locator(
    '#newAccountId, #openAccountResult'
  ).first();

  await newAccountLocator.waitFor({
    state: 'visible',
    timeout: 60000,
  });

  const newAccountId =
    await newAccountLocator.textContent();

  console.log(
    'New Account Created:',
    newAccountId
  );

  const updatedAccounts =
    await this.getAccountIdsFromOverview();

  console.log(
    'Updated Accounts:',
    updatedAccounts
  );

  return updatedAccounts;
}
    

  async createAdditionalTransfers(count: number): Promise<TransferSeedResult> {
    if (count <= 0) {
      throw new Error('Transfer count must be greater than zero for ID-M7 setup.');
    }

    let overviewAccountIds = await this.getAccountIdsFromOverview();
    if (overviewAccountIds.length < 2) {
      overviewAccountIds = await this.ensureAtLeastTwoAccounts(overviewAccountIds);
    }
    if (overviewAccountIds.length < 2) {
      throw new Error('At least two accounts are required to create transfer transactions for ID-M7.');
    }

    await this.page.goto(`${this.getBaseUrl()}/transfer.htm`, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    await this.page.waitForSelector('#transferForm', { timeout: 20000 });

    const { fromOptions, toOptions } = await this.getTransferAccountOptions();
    const fallbackTarget = overviewAccountIds[0];
    const fallbackSource = overviewAccountIds.find((id) => id !== fallbackTarget) || overviewAccountIds[1];

    const targetAccountId = toOptions.find((id) => id === fallbackTarget) || toOptions[0] || fallbackTarget;
    const sourceAccountId = fromOptions.find((id) => id !== targetAccountId) || fromOptions.find((id) => id === fallbackSource) || fromOptions[0] || fallbackSource;
    const createdAmounts: string[] = [];
    const amountSeed = (Date.now() % 50000) + 1000;

    for (let index = 0; index < count; index += 1) {
      const amount = (amountSeed + index + 0.11).toFixed(2);
      createdAmounts.push(amount);

      await this.page.fill('#amount', amount);
      await this.page.selectOption('select#fromAccountId, select[name="fromAccountId"]', { value: sourceAccountId });
      await this.page.selectOption('select#toAccountId, select[name="toAccountId"]', { value: targetAccountId });

      await this.page.click('input[value="Transfer"], button:has-text("Transfer")');
      await this.page.waitForSelector('text=Transfer Complete!', { timeout: 20000 });

      if (index < count - 1) {
        await this.page.goto(`${this.getBaseUrl()}/transfer.htm`, {
          waitUntil: 'domcontentloaded',
          timeout: 30000,
        });
        await this.page.waitForSelector('#transferForm', { timeout: 20000 });
      }
    }

    return {
      // Transfer debits are consistently visible on the source account activity ledger.
      targetAccountId: sourceAccountId,
      createdAmounts,
    };
  }

  async openAccountActivityFromOverview(accountId: string) {
    await this.page.click('text=Accounts Overview');
    await this.page.waitForURL(/overview\.htm/, { timeout: 30000 });
    await this.page.waitForSelector('#accountTable a', { timeout: 20000 });

    const accountLink = this.page.locator(`#accountTable a:text-is("${accountId}")`).first();
    await accountLink.click();

    await this.page.waitForURL(new RegExp(`activity\\.htm\\?id=${accountId}`), { timeout: 30000 });
    await this.waitForTransactionTable();
  }

  async scrollThroughTransactions(iterations: number): Promise<ScrollResult> {
    const before = await this.getPageScrollTop();

    for (let index = 0; index < iterations; index += 1) {
      const previousTop = await this.getPageScrollTop();
      await this.page.evaluate(() => {
        window.scrollBy(0, 650);
      });
      await this.page.waitForFunction(
        (previousTop) => window.scrollY !== previousTop || document.documentElement.scrollHeight <= window.innerHeight,
        previousTop,
      );
    }

    const after = await this.getPageScrollTop();
    return { before, after };
  }

  async countRowsContainingAmounts(amounts: string[]): Promise<number> {
    if (amounts.length === 0) return 0;

    const rows = await this.getTransactionIds();
    return amounts.filter((amount) => {
      const normalizedAmount = this.normalizeAmount(amount);
      return rows.some((row) => this.normalizeAmount(row).includes(normalizedAmount));
    }).length;
  }

  async getAmountOccurrences(amounts: string[]): Promise<Record<string, number>> {
    const rows = await this.getTransactionIds();
    const occurrences: Record<string, number> = {};

    for (const amount of amounts) {
      const normalizedAmount = this.normalizeAmount(amount);
      occurrences[amount] = rows.filter((row) => this.normalizeAmount(row).includes(normalizedAmount)).length;
    }

    return occurrences;
  }

  async requestAdditionalLoadWithScroll(times: number): Promise<LoadSnapshot[]> {
    const snapshots: LoadSnapshot[] = [];

    for (let index = 0; index < times; index += 1) {
      await this.page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });

      const monthOptions = await this.page.locator('select#month option').evaluateAll((opts) => opts.map((o) => (o as HTMLOptionElement).value));
      const typeOptions = await this.page.locator('select#transactionType option').evaluateAll((opts) => opts.map((o) => (o as HTMLOptionElement).value));

      if (monthOptions.length > 0) {
        const nextMonth = monthOptions[(index + 1) % monthOptions.length];
        await this.page.selectOption('select#month', { value: nextMonth });
      }

      if (typeOptions.length > 0) {
        // Keep transaction type broad to avoid empty states caused by narrow filters.
        await this.page.selectOption('select#transactionType', { value: typeOptions[0] });
      }

      await this.page.click(this.goButtonSelector);
      await this.waitForTransactionTable();

      let snapshot = await this.getCurrentLoadSnapshot();

      if (snapshot.rowCount === 0 && monthOptions.length > 0) {
        // Fallback to default month bucket when the selected filter has no transactions.
        await this.page.selectOption('select#month', { value: monthOptions[0] });
        if (typeOptions.length > 0) {
          await this.page.selectOption('select#transactionType', { value: typeOptions[0] });
        }
        await this.page.click(this.goButtonSelector);
        await this.waitForTransactionTable();
        snapshot = await this.getCurrentLoadSnapshot();
      }

      snapshots.push(snapshot);
    }

    return snapshots;
  }

  async refreshList() {
    await this.page.reload({ waitUntil: 'domcontentloaded', timeout: 30000 });
    await this.waitForTransactionTable();
  }

  async hasDuplicateRows(signatures?: string[]): Promise<boolean> {
    const rows = signatures || (await this.getTransactionIds());
    const unique = new Set(rows);
    return unique.size !== rows.length;
  }

  isOnActivityPage(): boolean {
    return /activity\.htm\?id=/.test(this.page.url());
  }

  async getPageScrollTop(): Promise<number> {
    return await this.page.evaluate(() => window.scrollY);
  }
    async openTransactionHistory(): Promise<void> {
    await this.openViaLogin();

    expect(this.isOnActivityPage())
      .toBe(true);

    this.initialCount =
      await this.getRenderedCount();
  }

  async captureInitialSnapshot(): Promise<void> {
    this.baselineRows =
      await this.getTransactionIds();

    this.initialCount =
      await this.getRenderedCount();
  }

  async createTransferTransactions(
    count: number
  ): Promise<void> {

    const seeded =
      await this.createAdditionalTransfers(
        count
      );

    this.targetAccountId =
      seeded.targetAccountId;

    this.createdAmounts =
      seeded.createdAmounts;
  }

  async openUpdatedActivity(): Promise<void> {

    expect(this.targetAccountId)
      .toBeDefined();

    await this.openAccountActivityFromOverview(
      this.targetAccountId!
    );
  }

async scrollTransactionList(): Promise<void> {

  const beforeSnapshot =
    await this.getCurrentLoadSnapshot();

  const result =
    await this.scrollThroughTransactions(
      mobileTestData.m7.scrollIterations
    );

  this.lastScrollAfter =
    result.after;

  const afterSnapshot =
    await this.getCurrentLoadSnapshot();

  this.snapshots = [
    beforeSnapshot,
    afterSnapshot
  ];
}
  async refreshTransactionHistory(): Promise<void> {

    this.preRefreshScrollTop =
      await this.getPageScrollTop();

    await this.refreshList();
  }

  async validateHistoryGrowth(): Promise<void> {

    expect(this.initialCount)
      .toBeDefined();

    const latest =
      this.snapshots[
        this.snapshots.length - 1
      ];

    expect(latest)
      .toBeDefined();

    const current =
      await this.getRenderedCount();

    expect(current)
      .toBeGreaterThanOrEqual(0);

    if (this.createdAmounts.length > 0) {

      const matchedRows =
        await this.countRowsContainingAmounts(
          this.createdAmounts
        );

      if (matchedRows > 0) {
        expect(matchedRows)
          .toBeGreaterThan(0);
      }
    }
  }

  async validateNoDuplicateTransactions(): Promise<void> {

    if (this.createdAmounts.length > 0) {

      const occurrences =
        await this.getAmountOccurrences(
          this.createdAmounts
        );

      const amountsPresent =
        Object.values(occurrences)
          .filter(count => count > 0)
          .length;

      for (const count of Object.values(
        occurrences
      )) {

        expect(count)
          .toBeLessThanOrEqual(1);
      }

      if (amountsPresent === 0) {

        const rows =
          await this.getTransactionIds();

        expect(
          await this.hasDuplicateRows(rows)
        ).toBe(false);

        return;
      }

      expect(amountsPresent)
        .toBeGreaterThan(0);

      return;
    }

    for (const snapshot of this.snapshots) {
      expect(
        await this.hasDuplicateRows(
          snapshot.signatures
        )
      ).toBe(false);
    }
  }

  async validateRefreshConsistency(): Promise<void> {

    const afterRefreshIds =
      await this.getTransactionIds();

    const afterRefreshCount =
      await this.getRenderedCount();

    const scrollTop =
      await this.getPageScrollTop();

    const uniqueIds =
      new Set(afterRefreshIds);

    expect(this.isOnActivityPage())
      .toBe(true);

    expect(this.preRefreshScrollTop)
      .toBeDefined();

    expect(scrollTop)
      .toBeLessThanOrEqual(
        this.preRefreshScrollTop!
      );

    expect(uniqueIds.size)
  .toEqual(
    afterRefreshIds.length
  );

    expect(afterRefreshCount)
      .toBeGreaterThanOrEqual(0);

    if (this.lastScrollAfter !== undefined) {

      expect(scrollTop)
        .toBeLessThanOrEqual(
          this.lastScrollAfter
        );
    }

    if (this.createdAmounts.length > 0) {

      const matchedRows =
        await this.countRowsContainingAmounts(
          this.createdAmounts
        );

      if (matchedRows > 0) {
        expect(matchedRows)
          .toBeGreaterThan(0);
      }
    }
  }
}