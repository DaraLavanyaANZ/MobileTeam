import { After, Status } from '@cucumber/cucumber';
import { Logger } from '../utils/Logger';
import { ScreenshotUtil } from '../utils/ScreenshotUtil';

After(async function (scenario) {
  const status = scenario.result?.status;

  if (status === Status.FAILED) {
    Logger.error(`Scenario failed: ${scenario.pickle.name}`);
    await ScreenshotUtil.captureOnFailure(scenario.pickle.name);
  }

  Logger.info(`Scenario completed with status: ${status ?? 'unknown'}`);
});
