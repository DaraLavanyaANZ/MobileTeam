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
}
