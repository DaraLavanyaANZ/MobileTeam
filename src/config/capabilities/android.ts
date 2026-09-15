import { envConfig } from '../environment';

export interface AndroidCapabilityConfig {
  platformName: string;
  'appium:deviceName': string;
  'appium:automationName': string;
  'appium:app': string;
  'appium:udid': string;
  'appium:appPackage': string;
  'appium:appActivity': string;
  'appium:appWaitActivity': string;
  'appium:autoGrantPermissions': boolean;
  'appium:noReset': boolean;
  'appium:newCommandTimeout': number;
}

export const buildAndroidCapabilities = (
  overrides: Partial<AndroidCapabilityConfig> = {}
): WebdriverIO.Capabilities => ({
  platformName: 'Android',
  'appium:deviceName': overrides['appium:deviceName'] ?? envConfig.deviceName,
  'appium:automationName': overrides['appium:automationName'] ?? envConfig.automationName,
  'appium:app': overrides['appium:app'] ?? envConfig.appPath,
  'appium:udid': overrides['appium:udid'] ?? envConfig.udid,
  'appium:appPackage': overrides['appium:appPackage'] ?? envConfig.appPackage,
  'appium:appActivity': overrides['appium:appActivity'] ?? envConfig.appActivity,
  'appium:appWaitActivity': overrides['appium:appWaitActivity'] ?? envConfig.appActivity,
  'appium:autoGrantPermissions': overrides['appium:autoGrantPermissions'] ?? envConfig.autoGrantPermissions,
  'appium:noReset': overrides['appium:noReset'] ?? false,
  'appium:newCommandTimeout': overrides['appium:newCommandTimeout'] ?? 300
});
