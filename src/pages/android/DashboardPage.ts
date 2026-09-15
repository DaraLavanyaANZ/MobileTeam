import { BasePage, Locator } from './BasePage';
import { LocatorConstants } from '../../constants/LocatorConstants';

export class DashboardPage extends BasePage {
  private readonly titleLocator: Locator = LocatorConstants.DASHBOARD_TITLE;
  private readonly menuLocator: Locator = LocatorConstants.MOBILE_MENU;
  private readonly transferLocator: Locator = LocatorConstants.TRANSFER_BUTTON;

  async isDisplayed(): Promise<boolean> {
    return await super.isDisplayed(this.titleLocator);
  }

  async openTransfer(): Promise<void> {
    await this.tap(this.transferLocator);
  }

  async openMenu(): Promise<void> {
    await this.tap(this.menuLocator);
  }
}
