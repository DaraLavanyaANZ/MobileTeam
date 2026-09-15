import { BasePage, Locator } from './BasePage';
import { LocatorConstants } from '../../constants/LocatorConstants';

export class DashboardPage extends BasePage {
  private readonly titleLocator: Locator = LocatorConstants.IOS_DASHBOARD_TITLE;

  async isDisplayed(): Promise<boolean> {
    return await super.isDisplayed(this.titleLocator);
  }
}
