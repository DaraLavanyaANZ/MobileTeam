import path from 'node:path';
import { buildAndroidCapabilities } from './capabilities/android';
import { buildIosCapabilities } from './capabilities/ios';
import { envConfig, getPlatform } from './environment';

const platform = getPlatform();
const selectedCapabilities = platform === 'ios' ? buildIosCapabilities() : buildAndroidCapabilities();

const projectRoot = path.resolve(__dirname, '../..');
const featurePatterns = [path.resolve(projectRoot, 'src/features/**/*.feature')];
const stepPatterns = [
  path.resolve(projectRoot, 'src/step-definitions/**/*.ts'),
  path.resolve(projectRoot, 'src/hooks/**/*.ts')
];

export const config: WebdriverIO.Config = {
  runner: 'local',
  specs: featurePatterns,
  exclude: [],
  maxInstances: 2,
  logLevel: 'info',
  bail: 0,
  baseUrl: '',
  waitforTimeout: 15000,
  connectionRetryTimeout: 180000,
  connectionRetryCount: 3,
  services: [
    [
      'appium',
      {
        command: 'appium',
        args: {
          address: envConfig.appiumHost,
          port: envConfig.appiumPort,
          relaxedSecurity: true
        }
      }
    ]
  ],
  framework: 'cucumber',
  reporters: [
    [
      'allure',
      {
        outputDir: path.resolve(process.cwd(), 'reports/allure-results'),
        disableWebdriverStepsReporting: true,
        disableWebdriverScreenshotsReporting: false,
        useCucumberStepReporter: true,
        addConsoleLogs: true
      }
    ]
  ],
  cucumberOpts: {
    require: stepPatterns,
    featurePaths: featurePatterns,
    tagExpression: '@smoke or @sanity or @regression or @critical',
    timeout: 120000,
    retry: 1,
    requireModule: ['ts-node/register/transpile-only']
  },
  capabilities: [selectedCapabilities]
};

export default config;
