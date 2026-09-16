# Mobile Banking Automation Framework

This repository contains an enterprise-ready mobile automation framework for Android and iOS using TypeScript, WebdriverIO, Appium 2.x, and Cucumber BDD. The design is fully isolated from Web and API automation and is optimized for banking applications with 1000+ test cases, reusable pages, robust reporting, and CI/CD execution.

## Core Features

- TypeScript-based automation with strict typing
- Appium 2.x + WebdriverIO 9.x
- Cucumber BDD with feature and scenario tagging
- Android-first architecture with iOS-ready structure
- Page Object Model (POM)
- Dynamic locator strategy support
- Explicit waits only
- Allure reporting integration
- Winston logging
- Screenshot capture on failure
- Environment-based configuration with dotenv
- Parallel execution support
- Retry mechanism
- Data-driven testing
- Device selection via command line
- CI/CD pipeline support for Azure DevOps and Jenkins

## Folder Structure

```text
mobile-framework/
├── src/
│   ├── config/
│   │   ├── android/
│   │   ├── ios/
│   │   ├── capabilities/
│   │   ├── environment/
│   │   └── wdio.conf.ts
│   │
│   ├── features/
│   │   ├── login/
│   │   │   ├── login.feature
│   │   │   └── loginSteps.ts
│   │   ├── account/
│   │   ├── dashboard/
│   │   └── transfer/
│   │
│   ├── pages/
│   │   ├── android/
│   │   │   ├── LoginPage.ts
│   │   │   ├── DashboardPage.ts
│   │   │   └── BasePage.ts
│   │   └── ios/
│   │       ├── LoginPage.ts
│   │       ├── DashboardPage.ts
│   │       └── BasePage.ts
│   │
│   ├── step-definitions/
│   │   ├── login/
│   │   ├── dashboard/
│   │   └── transfer/
│   │
│   ├── hooks/
│   │   ├── beforeScenario.ts
│   │   ├── afterScenario.ts
│   │   └── beforeFeature.ts
│   │
│   ├── utils/
│   │   ├── Logger.ts
│   │   ├── ScreenshotUtil.ts
│   │   ├── WaitUtil.ts
│   │   ├── DriverManager.ts
│   │   ├── DeviceManager.ts
│   │   └── CommonUtil.ts
│   │
│   ├── test-data/
│   │   ├── qa/
│   │   ├── sit/
│   │   ├── uat/
│   │   └── testData.json
│   │
│   ├── constants/
│   │   ├── LocatorConstants.ts
│   │   ├── Environment.ts
│   │   └── AppConstants.ts
│   │
│   ├── services/
│   │   ├── AppiumService.ts
│   │   └── DeviceService.ts
│   │
│   └── interfaces/
│       ├── User.ts
│       └── Device.ts
│
├── apps/
│   ├── android/
│   │   └── mybanking.apk
│   │
│   └── ios/
│       └── mybanking.app
│
├── reports/
│   ├── allure-results/
│   ├── allure-report/
│   ├── screenshots/
│   └── logs/
│
├── scripts/
│   ├── start-appium.sh
│   ├── stop-appium.sh
│   └── clean-reports.sh
│
├── .env.qa
├── .env.sit
├── .env.uat
├── cucumber.js
├── package.json
├── tsconfig.json
├── README.md
├── Jenkinsfile
├── azure-pipelines.yml
├── .gitignore
└──
```

## Folder Responsibilities

### src/config
Contains all runtime configuration for WebdriverIO, Appium capabilities, environment variables, platform-specific settings, and runner configuration.

### src/features
Stores Cucumber feature files and user-flow scenarios. This is where behavior is captured using Gherkin.

### src/pages
Contains page object classes for Android and iOS implementations. Each page abstracts the UI elements and actions for a screen.

### src/step-definitions
Contains the mapping between Gherkin steps and automation logic. Keeps the business-readable scenarios linked to test execution.

### src/hooks
Contains `Before`, `After`, and lifecycle hooks for setup, teardown, logging, screenshots, and test-state management.

### src/utils
Reusable utilities for logging, screenshots, waits, device handling, driver management, and common helper methods.

### src/test-data
Holds structured test data by environment and a common JSON dataset for data-driven tests.

### src/constants
Stores static constants for locators, environment keys, and app-specific values.

### src/services
Contains higher-level services for Appium lifecycle and device orchestration.

### src/interfaces
Defines critical TypeScript interfaces like `User` and `Device` for type-safe automation logic.

### reports
Target location for Allure results, screenshots, and logs generated during execution.

### apps
Stores the built Android and iOS app binaries for test execution.

### scripts
Contains environment setup scripts for starting and stopping Appium and cleaning generated artifacts.

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Install the Android Appium driver compatible with Appium 2.x:

```bash
npm run appium:install:android
```

3. Configure the Android SDK on your machine:

```powershell
$env:ANDROID_HOME = "C:\Users\<your-user>\AppData\Local\Android\Sdk"
$env:ANDROID_SDK_ROOT = $env:ANDROID_HOME
$env:Path += ";$env:ANDROID_HOME\platform-tools;$env:ANDROID_HOME\emulator;$env:ANDROID_HOME\cmdline-tools\latest\bin"
```

4. Start Appium 2.x:

```bash
npx appium server --port 4723
```

or use the helper script:

```bash
bash scripts/start-appium.sh
```

5. Run Android smoke tests:

```bash
npm run test:smoke
```

6. Generate and open the Allure report:

```bash
npm run report:allure
```

## Device Selection

Set the target device or platform through environment variables or command line arguments:

```bash
PLATFORM=android DEVICE_NAME="Pixel_7_Pro" ENVIRONMENT=qa npx wdio src/config/wdio.conf.ts
PLATFORM=ios DEVICE_NAME="iPhone 15" ENVIRONMENT=sit npx wdio src/config/wdio.conf.ts
```

## Tagging Strategy

Use the following tags in feature files for effective execution control:

- `@smoke`
- `@regression`
- `@sanity`
- `@critical`

Example:

```gherkin
@smoke @critical
Scenario: User logs in with valid credentials
  Given the user is on the login screen
  When the user enters valid credentials
  Then the dashboard should be visible
```

## M14 Touch Target Accessibility

M14 verifies that critical mobile banking controls provide a minimum 44 pixel touch target and at least 8 pixels of spacing. Reports are written to `reports/` by default:

- JSON: `reports/id-m14-touch-target-report.json`
- CSV: `reports/id-m14-touch-target-report.csv`
- Text: `reports/id-m14-touch-target-report.txt`

Run M14 headless or headed:

```bash
npm run test:mobile -- --tags "@ID-M14"
npm run test:mobile:headed -- --tags "@ID-M14"
npm run test:mobile:m14:report
```

The following environment variables can override the defaults:

- `MOBILE_TOUCH_TARGET_MIN_SIZE` or `TOUCH_TARGET_MIN_SIZE`
- `MOBILE_TOUCH_TARGET_MIN_SPACING` or `TOUCH_TARGET_MIN_SPACING`
- `MOBILE_TOUCH_REPORT_DIR`
- `MOBILE_TOUCH_REPORT_BASENAME`
- `MOBILE_TOUCH_REPORT_ENABLED`

## Best Practices Followed

- POM architecture for maintainability
- Explicit waits only; avoid implicit waits
- Centralized environment configuration
- Standardized naming conventions and locator management
- Retry and failure handling built into the framework
- Isolated mobile automation from UI, API, and web coverage
- Reusable hooks and utilities
- Strong logging and reporting for enterprise teams

## Enterprise Scalability Notes

This framework is designed for 1000+ automated mobile test cases and can be extended with:

- Page modules per feature area
- Utility services for vault integration and biometric simulation
- Data provider strategies for test-data JSON and CSV files
- Parallel execution on multiple emulator/device pools
- Centralized artifact retention for CI/CD systems

## Example Test Execution Matrix

| Platform | Router | Environment | Example Command |
| --- | --- | --- | --- |
| Android | Local emulator | QA | `npm run test:android` |
| iOS | Local simulator | QA | `npm run test:ios` |
| Android | Parallel | SIT | `npx wdio src/config/wdio.conf.ts --spec src/features/**/*.feature` |

## Framework Notes

The implementation intentionally isolates mobile-specific concerns such as Appium handling, gestures, and device management from browser or API automation patterns.
