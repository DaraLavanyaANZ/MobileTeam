export const AppConstants = {
  APP_NAME: 'ABC Bank',
  ANDROID_PACKAGE: 'com.app.hemanthbank',
  ANDROID_ACTIVITY: 'com.app.hemanthbank.MainActivity',
  DEFAULT_TIMEOUT_MS: 15000,
  SWIPE_DURATION_MS: 500,
  LONG_PRESS_DURATION_MS: 1500,
  TAGS: {
    SMOKE: '@smoke',
    REGRESSION: '@regression',
    SANITY: '@sanity',
    CRITICAL: '@critical'
  }
} as const;
