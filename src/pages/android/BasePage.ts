import { DeviceService } from '../../services/DeviceService';

export type Locator = {
  strategy: 'id' | 'xpath' | 'accessibility id' | 'class name' | 'android uiautomator';
  selector: string;
};

export class BasePage {
  protected readonly driver: WebdriverIO.Browser;
  protected readonly platform: 'android' | 'ios';

  constructor() {
    this.driver = browser;
    this.platform = DeviceService.resolvePlatform();
  }

  protected async getElement(locator: Locator): Promise<any> {
    const selector = locator.selector;
    switch (locator.strategy) {
      case 'id':
        return await $(`id=${selector}`);
      case 'xpath':
        return await $(`xpath=${selector}`);
      case 'accessibility id':
        return await $(`~${selector}`);
      case 'class name':
        return await $(`class name=${selector}`);
      case 'android uiautomator':
        return await $(`android=${selector}`);
      default:
        return await $(selector);
    }
  }

  protected async waitForVisible(locator: Locator, timeout = 15000): Promise<any> {
    const element = await this.getElement(locator);
    await element.waitForDisplayed({ timeout, timeoutMsg: `Element not displayed: ${locator.selector}` });
    return element;
  }

  protected async dismissAndroidCompatibilityDialog(): Promise<boolean> {
    if (this.platform !== 'android') {
      return false;
    }

    const startupDialogButtons: Locator[] = [
      { strategy: 'id', selector: 'android:id/aerr_wait' },
      { strategy: 'id', selector: 'android:id/button2' },
      { strategy: 'id', selector: 'android:id/button1' }
    ];

    for (const buttonLocator of startupDialogButtons) {
      try {
        const button = await this.getElement(buttonLocator);
        if (await button.isDisplayed()) {
          await button.click();
          await this.driver.pause(1500);
          return true;
        }
      } catch {
        // ignore missing startup dialog button
      }
    }

    return false;
  }

  protected async tap(locator: Locator): Promise<void> {
    const element = await this.waitForVisible(locator);
    await element.tap();
  }

  protected async type(locator: Locator, value: string): Promise<void> {
    const element = await this.waitForVisible(locator);
    await element.clearValue();
    await element.setValue(value);
  }

  protected async getText(locator: Locator): Promise<string> {
    const element = await this.waitForVisible(locator);
    return element.getText();
  }

  protected async findFirstVisible(locators: Locator[], timeout = 15000): Promise<any | null> {
    const start = Date.now();

    while (Date.now() - start < timeout) {
      for (const locator of locators) {
        try {
          const element = await this.getElement(locator);
          if (await element.isDisplayed()) {
            return element;
          }
        } catch {
          // continue to next locator
        }
      }
      await this.driver.pause(500);
    }

    return null;
  }

  protected async isDisplayed(locator: Locator): Promise<boolean> {
    try {
      const element = await this.getElement(locator);
      return await element.isDisplayed();
    } catch {
      return false;
    }
  }

  protected async swipe(direction: 'up' | 'down' | 'left' | 'right'): Promise<void> {
    await this.driver.execute('mobile: swipe', { direction });
  }

  protected async scrollToText(text: string, direction: 'up' | 'down' = 'down'): Promise<void> {
    await this.driver.execute('mobile: scroll', { direction, text });
  }

  protected async longPress(locator: Locator, duration = 1500): Promise<void> {
    const element = await this.waitForVisible(locator);
    await this.driver.execute('mobile: longClickGesture', {
      elementId: element.elementId,
      duration
    });
  }

  protected async tapCoordinates(x: number, y: number): Promise<void> {
    await this.driver.touchAction({ action: 'tap', x, y });
  }

  protected async dragAndDrop(from: Locator, to: Locator): Promise<void> {
    const source = await this.waitForVisible(from);
    const target = await this.waitForVisible(to);
    const sourceLocation = await source.getLocation();
    const targetLocation = await target.getLocation();

    await this.driver.execute('mobile: dragFromToForDuration', {
      fromX: sourceLocation.x,
      fromY: sourceLocation.y,
      toX: targetLocation.x,
      toY: targetLocation.y,
      duration: 500
    });
  }
}
