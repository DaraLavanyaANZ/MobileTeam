module.exports = {
  default: [
    '--require-module ts-node/register/transpile-only',
    '--require src/step-definitions/**/*.ts',
    '--require src/hooks/**/*.ts',
    '--format progress',
    '--format json:reports/cucumber-report.json'
  ].join(' ')
};
