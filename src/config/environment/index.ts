import * as dotenv from 'dotenv';
import path from 'node:path';

const envName = process.env.ENVIRONMENT ?? 'qa';

dotenv.config({ path: path.resolve(process.cwd(), `.env.${envName}`) });
dotenv.config();

const toNumber = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value ?? fallback);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const readEnv = (...keys: string[]): string | undefined => {
  for (const key of keys) {
    const value = process.env[key];
    if (value && value.trim().length > 0) {
      return value;
    }
  }

  return undefined;
};

export interface EnvironmentConfig {
  environment: string;
  platform: 'android' | 'ios';
  appPath: string;
  appiumHost: string;
  appiumPort: number;
  deviceName: string;
  udid: string;
  appPackage: string;
  appActivity: string;
  autoGrantPermissions: boolean;
  automationName: string;
}

export const envConfig: EnvironmentConfig = {
  environment: envName,
  platform: (readEnv('PLATFORM', 'ANDROID_PLATFORM_NAME') ?? 'android').toLowerCase() as 'android' | 'ios',
  appPath: readEnv('APP_PATH', 'ANDROID_APP_PATH') ?? path.resolve(process.cwd(), 'apps/android/ABCbank.apk'),
  appiumHost: readEnv('APPIUM_HOST', 'ANDROID_APPIUM_HOST') ?? '127.0.0.1',
  appiumPort: toNumber(readEnv('APPIUM_PORT', 'ANDROID_APPIUM_PORT'), 4723),
  deviceName: readEnv('DEVICE_NAME', 'ANDROID_DEVICE_NAME') ?? 'Pixel_7_Pro',
  udid: readEnv('UDID', 'ANDROID_UDID') ?? '',
  appPackage: readEnv('APP_PACKAGE', 'ANDROID_APP_PACKAGE') ?? 'com.app.hemanthbank',
  appActivity: readEnv('APP_ACTIVITY', 'ANDROID_APP_ACTIVITY') ?? 'com.app.hemanthbank.MainActivity',
  autoGrantPermissions: (readEnv('AUTO_GRANT_PERMISSIONS', 'ANDROID_AUTO_GRANT_PERMISSIONS') ?? 'true') === 'true',
  automationName: readEnv('AUTOMATION_NAME', 'ANDROID_AUTOMATION_NAME') ?? 'UiAutomator2'
};

export const getPlatform = (): 'android' | 'ios' => envConfig.platform;

export const getAppPath = (): string => {
  const selectedPlatform = getPlatform();
  if (selectedPlatform === 'ios') {
    return readEnv('APP_PATH', 'IOS_APP_PATH') ?? path.resolve(process.cwd(), 'apps/ios/mybanking.app');
  }
  return readEnv('APP_PATH', 'ANDROID_APP_PATH') ?? path.resolve(process.cwd(), 'apps/android/ABCbank.apk');
};
