import { Before } from '@cucumber/cucumber';
import { Logger } from '../utils/Logger';

Before(async function (scenario) {
  Logger.info(`Starting scenario: ${scenario.pickle.name}`);
});
