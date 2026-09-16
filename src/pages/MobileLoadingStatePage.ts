import { BrowserContext, Page, expect } from '@playwright/test';

export class MobileLoadingStatePage {
  private transferPostCount = 0;
  private pendingTransferRequests = 0;

  private baselineConfirmLabel = '';
  private amount = '';

  private sawLoadingStateInFlight = false;
  private sawDisabledInFlight = false;

  private cdpClient: any;
  private requestListenerAttached = false;

  constructor(
    private readonly page: Page,
    private readonly context: BrowserContext
  ) {}

  async openTransferScreen(): Promise<void> {
    await this.page.click('text=Transfer Funds');
    await this.page.waitForURL(/transfer\.htm/, {
      timeout: 20000,
    });

    await this.page.waitForSelector('#transferForm', {
      timeout: 20000,
    });
  }

  private isTransferRequest(
    url: string,
    method: string
  ): boolean {
    return method.toUpperCase() === 'POST';
  }

  async enableNetworkThrottling(): Promise<void> {
    this.cdpClient =
      await this.context.newCDPSession(this.page);

    await this.cdpClient.send('Network.enable');

    await this.cdpClient.send(
      'Network.emulateNetworkConditions',
      {
        offline: false,
        latency: 3000,
        downloadThroughput: 12 * 1024,
        uploadThroughput: 8 * 1024,
        connectionType: 'cellular3g',
      }
    );

    if (!this.requestListenerAttached) {
      this.attachRequestTracking();
      this.requestListenerAttached = true;
    }

    await this.installSubmitGuard();
  }

  private attachRequestTracking(): void {
    this.page.on('request', request => {
      if (
        this.isTransferRequest(
          request.url(),
          request.method()
        )
      ) {
        this.transferPostCount++;
        this.pendingTransferRequests++;
      }
    });

    this.page.on('requestfinished', request => {
      if (
        this.isTransferRequest(
          request.url(),
          request.method()
        )
      ) {
        this.pendingTransferRequests = Math.max(
          0,
          this.pendingTransferRequests - 1
        );
      }
    });

    this.page.on('requestfailed', request => {
      if (
        this.isTransferRequest(
          request.url(),
          request.method()
        )
      ) {
        this.pendingTransferRequests = Math.max(
          0,
          this.pendingTransferRequests - 1
        );
      }
    });
  }

  private async installSubmitGuard(): Promise<void> {
    await this.page.evaluate(() => {
      if ((window as any).__m9SubmitGuardInstalled)
        return;

      const form =
        document.querySelector(
          '#transferForm'
        ) as HTMLFormElement | null;

      if (!form) return;

      form.addEventListener(
        'submit',
        () => {
          const submit =
            (form.querySelector(
              'input[value="Transfer"]'
            ) ||
              form.querySelector(
                'button[type="submit"]'
              )) as
              | HTMLInputElement
              | HTMLButtonElement
              | null;

          if (submit) {
            submit.disabled = true;

            if (
              submit instanceof HTMLInputElement
            ) {
              submit.value = 'Processing...';
            }
          }

          const showResult =
            document.querySelector(
              '#showResult'
            ) as HTMLElement | null;

          if (showResult) {
            showResult.style.display = 'block';
            showResult.textContent =
              'Processing transfer...';
          }
        },
        true
      );

      (window as any).__m9SubmitGuardInstalled = true;
    });
  }

  async prepareValidTransfer(): Promise<void> {
    await this.page.waitForFunction(() => {
      const from =
        document.querySelector(
          '#fromAccountId'
        ) as HTMLSelectElement | null;

      const to =
        document.querySelector(
          '#toAccountId'
        ) as HTMLSelectElement | null;

      return (
        !!from &&
        !!to &&
        from.options.length > 1 &&
        to.options.length > 1
      );
    });

    const fromOptions =
      await this.page
        .locator(
          'select#fromAccountId option'
        )
        .evaluateAll(options =>
          options
            .map(
              o =>
                (o as HTMLOptionElement).value
            )
            .filter(Boolean)
        );

    const toOptions =
      await this.page
        .locator(
          'select#toAccountId option'
        )
        .evaluateAll(options =>
          options
            .map(
              o =>
                (o as HTMLOptionElement).value
            )
            .filter(Boolean)
        );

    const fromAccount =
      fromOptions[0];

    const toAccount =
      toOptions.find(
        x => x !== fromAccount
      ) || toOptions[0];

    this.amount =
      process.env.MOBILE_M9_TRANSFER_AMOUNT?.trim() ||
      (
        (Date.now() % 5000) +
        50.37
      ).toFixed(2);

    await this.page.fill(
      '#amount',
      this.amount
    );

    await this.page.selectOption(
      '#fromAccountId',
      fromAccount
    );

    await this.page.selectOption(
      '#toAccountId',
      toAccount
    );

    const btn =
      this.page
        .locator(
          'input[value="Transfer"],button[type="submit"]'
        )
        .first();

    this.baselineConfirmLabel =
      await btn.evaluate(element => {
        if (
          element instanceof
          HTMLInputElement
        ) {
          return element.value.trim();
        }

        return (
          element.textContent || ''
        ).trim();
      });
  }

  async submitTransferTwice(): Promise<void> {
    const submitState = await this.page.evaluate(() => {
      const submit =
        (document.querySelector(
          '#transferForm input[value="Transfer"]'
        ) ||
          document.querySelector(
            '#transferForm button[type="submit"]'
          )) as
          | HTMLInputElement
          | HTMLButtonElement
          | null;

      if (!submit) {
        throw new Error(
          'Transfer button not found'
        );
      }

      submit.click();

      if (!submit.disabled) {
        submit.click();
      }

      return {
        loadingLike: submit.disabled ||
          document.querySelector('#showResult') !== null,
        submitLocked: submit.disabled,
      };
    });

    this.sawLoadingStateInFlight = submitState.loadingLike;
    this.sawDisabledInFlight = submitState.submitLocked;

    const handle =
      await this.page.waitForFunction(
        baselineLabel => {
          const submit =
            (document.querySelector(
              'input[value="Transfer"]'
            ) ||
              document.querySelector(
                'button[type="submit"]'
              )) as
              | HTMLInputElement
              | HTMLButtonElement
              | null;

          const result =
            document.querySelector(
              '#showResult'
            );

          const visible =
            !!result &&
            window.getComputedStyle(
              result
            ).display !== 'none';

          let currentLabel = '';

          if (
            submit instanceof
            HTMLInputElement
          ) {
            currentLabel =
              submit.value.trim();
          }

          if (
            submit instanceof
            HTMLButtonElement
          ) {
            currentLabel =
              (
                submit.textContent || ''
              ).trim();
          }

          return {
            loadingLike:
              visible ||
              currentLabel !==
                baselineLabel ||
              submit?.disabled,
            submitLocked:
              !!submit &&
              submit.disabled,
          };
        },
        this.baselineConfirmLabel
      );

    const result =
      (await handle.jsonValue()) as {
        loadingLike: boolean;
        submitLocked: boolean;
      };

    this.sawLoadingStateInFlight =
      this.sawLoadingStateInFlight ||
      result.loadingLike;

    this.sawDisabledInFlight =
      this.sawDisabledInFlight ||
      result.submitLocked;
  }

  async waitForRequestsToComplete() {
    await expect
      .poll(
        () =>
          this.pendingTransferRequests,
        {
          timeout: 30000,
        }
      )
      .toBe(0);
  }

  async restoreNetwork(): Promise<void> {
    if (!this.cdpClient) return;

    await this.cdpClient.send(
      'Network.emulateNetworkConditions',
      {
        offline: false,
        latency: 0,
        downloadThroughput: -1,
        uploadThroughput: -1,
        connectionType: 'none',
      }
    );

    await this.cdpClient.send(
      'Network.disable'
    );
  }

  async validateTransferSuccess(): Promise<void> {
    await this.page.waitForSelector(
      '#showResult, #showError',
      {
        timeout: 30000,
      }
    );

    const errorVisible =
      await this.page
        .locator('#showError')
        .first()
        .isVisible()
        .catch(() => false);

    expect(errorVisible).toBe(false);
  }

  getTransferCount(): number {
    return this.transferPostCount;
  }

  getAmount(): string {
    return this.amount;
  }

  didShowLoadingState(): boolean {
    return this.sawLoadingStateInFlight;
  }

  didDisableSubmitButton(): boolean {
    return this.sawDisabledInFlight;
  }
}