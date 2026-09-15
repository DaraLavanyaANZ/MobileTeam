import allure from '@wdio/allure-reporter';

export class ScreenshotUtil {
  static async captureOnFailure(scenarioName?: string): Promise<void> {
    try {
      const screenshot = await browser.takeScreenshot();
      const attachmentName = scenarioName ? `${scenarioName}-failure` : 'failure-screenshot';
      allure.addAttachment(attachmentName, Buffer.from(screenshot, 'base64'), 'image/png');
    } catch (error) {
      console.warn('Failure screenshot could not be captured.', error);
    }
  }
}
