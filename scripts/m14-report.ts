const fs = require('node:fs');
const path = require('node:path');

const reportsDir = process.env.MOBILE_TOUCH_REPORT_DIR || 'reports';
const baseName = process.env.MOBILE_TOUCH_REPORT_BASENAME || 'id-m14-touch-target-report';
const paths = {
  json: path.join(reportsDir, `${baseName}.json`),
  csv: path.join(reportsDir, `${baseName}.csv`),
  text: path.join(reportsDir, `${baseName}.txt`),
};

const missing = Object.entries(paths)
  .filter(([, reportPath]) => !fs.existsSync(reportPath))
  .map(([format, reportPath]) => `${format}: ${reportPath}`);

if (missing.length > 0) {
  console.error('M14 report files are missing:');
  for (const report of missing) console.error(`- ${report}`);
  process.exitCode = 1;
} else {
  const records = JSON.parse(fs.readFileSync(paths.json, 'utf8'));
  const failures = records.filter((record) => record.id !== 'ID-M14' || record.status !== 'pass');
  console.log(`M14 reports found in ${reportsDir}`);
  console.log(`JSON: ${paths.json}`);
  console.log(`CSV: ${paths.csv}`);
  console.log(`Text: ${paths.text}`);
  console.log(`Records: ${records.length}`);
  console.log(`Failures: ${failures.length}`);
  if (failures.length > 0) process.exitCode = 1;
}
