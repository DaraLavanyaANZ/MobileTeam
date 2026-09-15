import { User } from '../../interfaces/User';
import { LocatorConstants } from '../../constants/LocatorConstants';
import { BasePage, Locator } from './BasePage';
import { envConfig } from '../../config/environment';
import { TotpUtil } from '../../utils/TotpUtil';

export class LoginPage extends BasePage {
  private readonly usernameLocator: Locator = LocatorConstants.LOGIN_USERNAME;
  private readonly emailLocator: Locator = LocatorConstants.LOGIN_EMAIL;
  private readonly passwordLocator: Locator = LocatorConstants.LOGIN_PASSWORD;
  private readonly loginButtonLocator: Locator = LocatorConstants.LOGIN_BUTTON;
  private readonly usernameEntryLocators: Locator[] = [
    LocatorConstants.LOGIN_USERNAME,
    LocatorConstants.LOGIN_EMAIL,
    { strategy: 'accessibility id', selector: 'Mobile / Email' },
    { strategy: 'xpath', selector: '//android.widget.EditText[@hint="Mobile / Email" or @text="Mobile / Email"]' }
  ];
  private readonly passwordEntryLocators: Locator[] = [
    LocatorConstants.LOGIN_PASSWORD,
    { strategy: 'accessibility id', selector: 'Password' },
    { strategy: 'xpath', selector: '//android.widget.EditText[@hint="Password" or @text="Password"]' }
  ];
  private readonly loginScreenLocators: Locator[] = [
    LocatorConstants.LOGIN_USERNAME,
    LocatorConstants.LOGIN_EMAIL,
    LocatorConstants.LOGIN_PASSWORD,
    LocatorConstants.LOGIN_BUTTON,
    { strategy: 'id', selector: 'com.app.hemanthbank:id/text_title' },
    { strategy: 'id', selector: 'com.app.hemanthbank:id/text_brand' }
  ];
  private readonly mfaLocators: Locator[] = [
    LocatorConstants.MFA_CODE_INPUT,
    LocatorConstants.MFA_CODE_INPUT_ALT_1,
    LocatorConstants.MFA_CODE_INPUT_ALT_2,
    LocatorConstants.MFA_CODE_INPUT_ALT_3
  ];

  async open(): Promise<void> {
    const timeout = 90000;
    const start = Date.now();

    while (Date.now() - start < timeout) {
      try {
        const currentPackage = await this.driver.getCurrentPackage();
        if (currentPackage !== envConfig.appPackage) {
          await this.driver.activateApp(envConfig.appPackage);
          await this.driver.pause(1000);
        }
      } catch {
        // continue waiting for app context
      }

      const loginSurface = await this.findFirstVisible(this.loginScreenLocators, 2000);
      if (loginSurface) {
        return;
      }

      const dismissed = await this.dismissAndroidCompatibilityDialog();
      if (dismissed) {
        continue;
      }

      await this.driver.pause(500);
    }

    throw new Error('Login screen was not displayed.');
  }

  async enterUsername(username: string): Promise<void> {
    const emailValue = username || '';

    const usernameElement = await this.findFirstVisible(this.usernameEntryLocators, 45000);
    if (!usernameElement) {
      throw new Error('Username input field was not visible.');
    }

    await usernameElement.clearValue();
    await usernameElement.setValue(emailValue);
  }

  async enterPassword(password: string): Promise<void> {
    const passwordElement = await this.findFirstVisible(this.passwordEntryLocators, 45000);
    if (!passwordElement) {
      throw new Error('Password input field was not visible.');
    }

    await passwordElement.clearValue();
    await passwordElement.setValue(password);
  }

  async tapLogin(): Promise<void> {
    await this.tap(this.loginButtonLocator);
  }

  async enterMfaCode(code?: string): Promise<boolean> {
    const otpCode = this.resolveOtpCode(code);
    if (!otpCode) {
      return false;
    }

    const mfaInput = await this.findFirstVisible(this.mfaLocators, 15000);
    if (!mfaInput) {
      return false;
    }

    await mfaInput.clearValue();
    await mfaInput.setValue(otpCode);

    const verifyButton = await this.getElement(LocatorConstants.MFA_VERIFY_BUTTON);
    try {
      if (await verifyButton.isDisplayed()) {
        await verifyButton.click();
      }
    } catch {
      // no verify button is shown; MFA field is enough in some apps
    }

    return true;
  }

  private resolveOtpCode(code?: string): string {
    const totpSecret = process.env.MFA_TOTP_SECRET;
    if (totpSecret) {
      return TotpUtil.generateFromBase32(totpSecret);
    }

    return code ?? process.env.MFA_CODE ?? '';
  }

  async login(user: User): Promise<void> {
    const email = user.email ?? user.username ?? '';
    await this.enterUsername(email);
    await this.enterPassword(user.password);
    await this.tapLogin();
    await this.enterMfaCode(user.mfaCode);
  }
}
