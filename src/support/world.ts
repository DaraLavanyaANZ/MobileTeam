import { IWorldOptions, World, setDefaultTimeout, setWorldConstructor } from '@cucumber/cucumber';
import type { Browser } from 'webdriverio';

setDefaultTimeout(90000);

export class MyBankingAndroidWorld extends World {
  driver!: Browser;

  constructor(options: IWorldOptions) {
    super(options);
    this.driver = browser as Browser;
  }

  async initialize(): Promise<void> {
    this.driver = browser as Browser;
  }

  async dispose(): Promise<void> {
    return;
  }

  async dismissKnownSystemDialogs(): Promise<boolean> {
    const candidateButtons = [
      'android:id/button2',
      'android:id/button1',
      'android:id/aerr_wait',
      'android:id/aerr_close'
    ];

    for (const selector of candidateButtons) {
      try {
        const button = await this.driver.$(`id=${selector}`);
        if (await button.isDisplayed()) {
          await button.click();
          await this.driver.pause(1500);
          return true;
        }
      } catch {
        // continue searching for the next dialog button
      }
    }

    return false;
  }

  async waitForLoginScreen(timeout = 30000): Promise<boolean> {
    const loginFields = ['com.app.hemanthbank:id/edit_identifier', 'com.app.hemanthbank:id/edit_password'];
    const start = Date.now();

    while (Date.now() - start < timeout) {
      for (const selector of loginFields) {
        try {
          const element = await this.driver.$(`id=${selector}`);
          if (await element.isDisplayed()) {
            return true;
          }
        } catch {
          // continue waiting
        }
      }

      const dismissed = await this.dismissKnownSystemDialogs();
      if (!dismissed) {
        await this.driver.pause(500);
      }
    }

    return false;
  }
}

setWorldConstructor(MyBankingAndroidWorld);