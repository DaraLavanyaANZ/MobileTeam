import { Before } from '@cucumber/cucumber';
import { Logger } from '../utils/Logger';

Before(async function () {
  Logger.info('Feature execution started.');
});
