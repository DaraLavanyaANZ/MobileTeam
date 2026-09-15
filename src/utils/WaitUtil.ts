export class WaitUtil {
  static async waitUntilVisible(selector: string, timeout = 15000): Promise<boolean> {
    return browser.waitUntil(
      async () => {
        const element = await $(selector);
        return element.isDisplayed();
      },
      {
        timeout,
        interval: 500,
        timeoutMsg: `Element not visible within ${timeout}ms: ${selector}`
      }
    );
  }

  static async waitUntilTextPresent(selector: string, text: string, timeout = 15000): Promise<boolean> {
    return browser.waitUntil(
      async () => {
        const element = await $(selector);
        return (await element.getText()).toLowerCase().includes(text.toLowerCase());
      },
      {
        timeout,
        interval: 500,
        timeoutMsg: `Text '${text}' not found in ${selector}`
      }
    );
  }
}
