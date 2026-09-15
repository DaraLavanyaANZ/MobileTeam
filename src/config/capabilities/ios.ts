import { envConfig } from '../environment';

export interface IosCapabilityConfig {
  platformName: string;
  'appium:deviceName': string;
  'appium:automationName': string;
  'appium:app': string;
  'appium:udid': string;
  'appium:autoAcceptAlerts': boolean;
  'appium:noReset': boolean;
  'appium:newCommandTimeout': number;
}

export const buildIosCapabilities = (
  overrides: Partial<IosCapabilityConfig> = {}
): WebdriverIO.Capabilities => ({
  platformName: 'iOS',
  'appium:deviceName': overrides['appium:deviceName'] ?? envConfig.deviceName,
  'appium:automationName': overrides['appium:automationName'] ?? 'XCUITest',
  'appium:app': overrides['appium:app'] ?? envConfig.appPath,
  'appium:udid': overrides['appium:udid'] ?? envConfig.udid,
  'appium:autoAcceptAlerts': overrides['appium:autoAcceptAlerts'] ?? true,
  'appium:noReset': overrides['appium:noReset'] ?? false,
  'appium:newCommandTimeout': overrides['appium:newCommandTimeout'] ?? 300
});
