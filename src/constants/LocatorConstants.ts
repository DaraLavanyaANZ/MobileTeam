export const LocatorConstants = {
  LOGIN_EMAIL: { strategy: 'id', selector: 'com.app.hemanthbank:id/edit_identifier' },
  LOGIN_USERNAME: { strategy: 'id', selector: 'com.app.hemanthbank:id/edit_identifier' },
  LOGIN_PASSWORD: { strategy: 'id', selector: 'com.app.hemanthbank:id/edit_password' },
  LOGIN_BUTTON: { strategy: 'id', selector: 'com.app.hemanthbank:id/button_login' },
  DASHBOARD_TITLE: { strategy: 'xpath', selector: '//*[contains(@text, "Welcome") or contains(@text, "Home") or contains(@text, "Dashboard") or contains(@text, "Accounts")]' },
  MOBILE_MENU: { strategy: 'accessibility id', selector: 'menu' },
  ACCOUNT_LIST: { strategy: 'xpath', selector: '//android.widget.TextView[@text="Accounts"]' },
  TRANSFER_BUTTON: { strategy: 'accessibility id', selector: 'Transfer' },
  MFA_CODE_INPUT: { strategy: 'id', selector: 'com.app.hemanthbank:id/edit_code' },
  MFA_CODE_INPUT_ALT_1: { strategy: 'id', selector: 'com.app.hemanthbank:id/edit_code' },
  MFA_CODE_INPUT_ALT_2: { strategy: 'id', selector: 'com.app.hemanthbank:id/edit_code' },
  MFA_CODE_INPUT_ALT_3: { strategy: 'id', selector: 'com.app.hemanthbank:id/edit_code' },
  MFA_VERIFY_BUTTON: { strategy: 'id', selector: 'com.app.hemanthbank:id/button_verify' },
  IOS_LOGIN_USERNAME: { strategy: 'accessibility id', selector: 'usernameTextField' },
  IOS_LOGIN_PASSWORD: { strategy: 'accessibility id', selector: 'passwordTextField' },
  IOS_LOGIN_BUTTON: { strategy: 'accessibility id', selector: 'loginButton' },
  IOS_DASHBOARD_TITLE: { strategy: 'accessibility id', selector: 'dashboardTitle' }
} as const;
