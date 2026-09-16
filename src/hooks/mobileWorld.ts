import { After, Before } from '@cucumber/cucumber';
import { MobileWorld } from '../support/world';

Before(async function (this: MobileWorld) {
  await this.initialize();
});

After(async function (this: MobileWorld) {
  await this.dispose();
});