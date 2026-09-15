import { User } from '../../interfaces/User';
import { LocatorConstants } from '../../constants/LocatorConstants';
import { BasePage, Locator } from './BasePage';

export class LoginPage extends BasePage {
  private readonly usernameLocator: Locator = LocatorConstants.IOS_LOGIN_USERNAME;
  private readonly passwordLocator: Locator = LocatorConstants.IOS_LOGIN_PASSWORD;
  private readonly loginButtonLocator: Locator = LocatorConstants.IOS_LOGIN_BUTTON;

  async open(): Promise<void> {
    await this.waitForVisible(this.usernameLocator, 20000);
  }

  async enterUsername(username: string): Promise<void> {
    await this.type(this.usernameLocator, username);
  }

  async enterPassword(password: string): Promise<void> {
    await this.type(this.passwordLocator, password);
  }

  async tapLogin(): Promise<void> {
    await this.tap(this.loginButtonLocator);
  }

  async login(user: User): Promise<void> {
    const username = user.email ?? user.username ?? '';
    await this.enterUsername(username);
    await this.enterPassword(user.password);
    await this.tapLogin();
  }
}
