export class DriverManager {
  static getDriver(): WebdriverIO.Browser {
    return browser;
  }

  static async setContext(context: string): Promise<void> {
    await browser.switchContext(context);
  }

  static async getCurrentContext(): Promise<string> {
    const context = await browser.getContext();
    return String(context);
  }
}
