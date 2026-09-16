module.exports = {
  default: [
    '--require-module ts-node/register/transpile-only',
     '--require src/support/world.ts',
    '--require src/step-definitions/**/*.ts',
    '--require src/hooks/**/*.ts',
    'src/features/**/*.feature',
    '--format progress',
    '--format json:reports/cucumber-report.json'
  ].join(' '),
  mobile: [
    '--require-module ts-node/register/transpile-only',
    '--require src/support/world.ts',
    '--require src/step-definitions/mobile*.ts',
    '--require src/step-definitions/mobile.offline-reconnect.steps.ts',
    '--require src/hooks/mobileWorld.ts',
    'src/features/mobile*.feature',
    '--format progress',
    '--format json:reports/cucumber-report.json'
  ].join(' ')
};
