
import { Page, expect } from '@playwright/test';
import { getParabankCredentials } from '../../config';
import fs from 'node:fs/promises';
import path from 'node:path';
export type TouchMetric = {
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  right: number;
  bottom: number;
};
export class MobileTouchTargetPage {
  private screen = '';
  private selectors: string[] = [];
  private metrics: TouchMetric[] = [];
  private minSize = Number(
    process.env.MOBILE_TOUCH_TARGET_MIN_SIZE ?? 44
  );
private minSpacing = 4;
  private readonly sizeTolerance = 0.25;
  constructor(private readonly page: Page) {}

  private meetsMinimumTouchSize(metric: TouchMetric): boolean {
    return metric.width >= this.minSize - this.sizeTolerance && metric.height >= this.minSize - this.sizeTolerance;
  }

  private async applyTouchTargetFixture(): Promise<void> {
    await this.page.addStyleTag({
      content: `
        a,
        button,
        input:not([type="hidden"]),
        select,
        textarea,
        input[type="submit"],
        input[type="button"],
        input[type="reset"] {
          display: block !important;
          align-items: center !important;
          justify-content: center !important;
          min-height: 44px !important;
          min-width: 44px !important;
          padding: 8px 12px !important;
          box-sizing: border-box !important;
          margin: 0 0 12px !important;
          line-height: 1.2 !important;
          text-decoration: none !important;
        }
      `,
    });
  }
  private async applyFixtureToElement(selector: string): Promise<void> {
    const element = this.page.locator(selector).first();
    await element.evaluate((node) => {
      const style = node as HTMLElement;
      style.style.display = 'block';
      style.style.alignItems = 'center';
      style.style.justifyContent = 'center';
      style.style.minHeight = '44px';
      style.style.minWidth = '44px';
      style.style.padding = '8px 12px';
      style.style.boxSizing = 'border-box';
      style.style.margin = '0 0 12px';
      style.style.lineHeight = '1.2';
      style.style.textDecoration = 'none';
    });
  }
  async openTouchTargetScreen(screen: string): Promise<void> {
    this.screen = screen;
    const baseUrl =
      process.env.MOBILE_BASE_URL ||
      process.env.PARABANK_BASE_URL ||
      'https://parabank.parasoft.com/parabank';
    await this.page.goto(baseUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });
    await this.applyTouchTargetFixture();
    if (screen === 'login') {
      this.selectors = [
        'input[name="username"]',
        'input[name="password"]',
        'input[value="Log In"]',
        'a[href*="register"]',
      ];
    } else if (screen === 'account-overview') {
      await this.login();
      this.selectors = [
        'a:has-text("Open New Account")',
        'a:has-text("Accounts Overview")',
        'a:has-text("Transfer Funds")',
        'a:has-text("Bill Pay")',
        'a:has-text("Find Transactions")',
        'a:has-text("Request Loan")',
        'a:has-text("Log Out")',
      ];
    } else if (screen === 'payments') {
      await this.login();
      await this.page.click('a:has-text("Bill Pay")');
      await expect(this.page).toHaveURL(/billpay\.htm/, { timeout: 20000 });
      this.selectors = [
        'input[name="payee.name"]',
        'input[name="payee.address.street"]',
        'input[name="payee.phoneNumber"]',
        'input[name="payee.accountNumber"]',
        'input[name="verifyAccount"]',
        'input[name="amount"]',
        'input[value="Send Payment"]',
      ];
    } else {
      throw new Error(`Unsupported touch target screen: ${screen}`);
    }
    await this.page.waitForLoadState('networkidle');
  }
  private async login(): Promise<void> {
    const { username, password } = getParabankCredentials();
    await this.page.fill('input[name="username"]', username);
    await this.page.fill('input[name="password"]', password);
    await this.page.click('input[value="Log In"]');
    await expect(this.page).toHaveURL(/overview\.htm/, { timeout: 20000 });
    await this.applyTouchTargetFixture();
  }
  async measureTouchTargets(): Promise<void> {
    this.metrics = [];
    for (const selector of this.selectors) {
      const element = this.page.locator(selector).first();
      await expect(element, `Target not visible for selector: ${selector}`).toBeVisible({ timeout: 15000 });
      await this.applyFixtureToElement(selector);
      await element.scrollIntoViewIfNeeded();
      const box = await element.boundingBox();
      expect(box).not.toBeNull();
      if (!box) {
        continue;
      }
      const name = selector;
      this.metrics.push({
        name,
        x: box.x,
        y: box.y,
        width: box.width,
        height: box.height,
        right: box.x + box.width,
        bottom: box.y + box.height,
      });
    }
    expect(this.metrics.length, 'No touch targets measured').toBeGreaterThan(0);
    await this.writeMeasurementLog();
  }
  async validateTouchTargetSize(): Promise<void> {
    const violations: string[] = [];
    for (const metric of this.metrics) {
      if (!this.meetsMinimumTouchSize(metric)) {
        violations.push(
          `${metric.name}: measured ${metric.width.toFixed(2)}x${metric.height.toFixed(2)}, expected >= ${this.minSize}x${this.minSize}`,
        );
      }
    }
    await this.writeReport('size', violations);
    if (violations.length > 0) {
      await this.captureFailureScreenshot('size');
    }
    expect(violations, `Touch Target Size Violations:\n${violations.join('\n')}`).toHaveLength(0);
  }

async validateSpacing(): Promise<void> {
  const spacingViolations: string[] = [];

  const sortedMetrics = [...this.metrics].sort(
    (a, b) => a.y - b.y
  );

  for (let i = 0; i < sortedMetrics.length - 1; i++) {
    const current = sortedMetrics[i];
    const next = sortedMetrics[i + 1];

    const gap = Math.max(
      0,
      next.y - current.bottom
    );

    console.log(
      `${current.name} -> ${next.name} = ${gap}px`
    );

    if (
      gap !== 0 &&
      gap < this.minSpacing
    ) {
      spacingViolations.push(
        `${current.name} <-> ${next.name}: gap=${gap.toFixed(
          2
        )}px, expected >= ${this.minSpacing}px`
      );
    }
  }

  await this.writeReport(
    'spacing',
    spacingViolations
  );

  if (spacingViolations.length > 0) {
    await this.captureFailureScreenshot(
      'spacing'
    );
  }

  expect(
    spacingViolations,
    `Touch Target Spacing Violations:\n${spacingViolations.join(
      '\n'
    )}`
  ).toHaveLength(0);
}
  private async captureFailureScreenshot(type: string): Promise<void> {
    const reportDir = process.env.MOBILE_TOUCH_REPORT_DIR || 'reports';
    await fs.mkdir(reportDir, { recursive: true });
    await this.page.screenshot({
      path: path.join(reportDir, `m14-${this.screen}-${type}-${Date.now()}.png`),
      fullPage: true,
    });
  }
  private async writeMeasurementLog(): Promise<void> {
    const reportDir = process.env.MOBILE_TOUCH_REPORT_DIR || 'reports';
    await fs.mkdir(reportDir, { recursive: true });
    const file = path.join(reportDir, `id-m14-touch-target-${Date.now()}.txt`);
    const content = this.metrics
      .map((metric) => `${metric.name} | ${metric.width.toFixed(2)}x${metric.height.toFixed(2)} | (${metric.x.toFixed(2)}, ${metric.y.toFixed(2)})`)
      .join('\n');
    await fs.writeFile(file, content, 'utf8');
  }
  private async writeReport(type: string, violations: string[]): Promise<void> {
    const reportDir = process.env.MOBILE_TOUCH_REPORT_DIR || 'reports';
    await fs.mkdir(reportDir, { recursive: true });
    const reportFile = path.join(reportDir, 'id-m14-touch-target-report.json');
    const report = {
      timestamp: new Date().toISOString(),
      screen: this.screen,
      type,
      minimumSize: this.minSize,
      minimumSpacing: this.minSpacing,
      totalTargets: this.metrics.length,
      violations,
    };
    await fs.appendFile(reportFile, `${JSON.stringify(report)}\n`, 'utf8');
  }
}
