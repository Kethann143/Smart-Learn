/**
 * generateReport.js
 * Compiles test-runs-raw.jsonl into a premium HTML report and a Markdown summary.
 * Runs Python generate_excel.py to generate the finalized Excel report.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.join(__dirname, '..');
const resultsDir = path.join(rootDir, 'Test Results');
const rawLogPath = path.join(resultsDir, 'Logs', 'test-runs-raw.jsonl');

// Ensure directories exist
fs.mkdirSync(path.join(resultsDir, 'Excel'), { recursive: true });
fs.mkdirSync(path.join(resultsDir, 'HTML'), { recursive: true });
fs.mkdirSync(path.join(resultsDir, 'Summary'), { recursive: true });
fs.mkdirSync(path.join(resultsDir, 'Screenshots'), { recursive: true });
fs.mkdirSync(path.join(resultsDir, 'Logs'), { recursive: true });

let rawRuns = [];
if (fs.existsSync(rawLogPath)) {
  const content = fs.readFileSync(rawLogPath, 'utf8');
  rawRuns = content.split('\n')
    .filter(line => line.trim())
    .map(line => JSON.parse(line));
  console.log(`[OK] Loaded ${rawRuns.length} raw test outcomes.`);
} else {
  console.log('[WARN] test-runs-raw.jsonl not found. Generating default mock outcomes.');
}

// Convert outcomes into a lookup table by TC identifier (e.g. TC001)
const outcomes = {};
rawRuns.forEach(run => {
  const match = run.title.match(/TC\d{3}/);
  if (match) {
    const tcId = match[0];
    outcomes[tcId] = {
      passed: run.passed,
      duration: run.duration,
      error: run.error,
      screenshot: run.screenshot
    };
  }
});

// Compile metrics
let totalCount = 305;
let passedCount = 0;
let failedCount = 0;
let skippedCount = 0;
const failureDetails = [];

// Generate results JSON for Python to ingest
const resultsLookup = {};
for (let i = 1; i <= totalCount; i++) {
  const tcId = `TC${String(i).padStart(3, '0')}`;
  const outcome = outcomes[tcId];
  if (outcome) {
    if (outcome.passed) {
      passedCount++;
      resultsLookup[tcId] = { status: 'Pass', remarks: '' };
    } else {
      failedCount++;
      resultsLookup[tcId] = { status: 'Fail', remarks: outcome.error || 'Assertion failed' };
      failureDetails.push({ id: tcId, error: outcome.error || 'Assertion failed' });
    }
  } else {
    skippedCount++;
    resultsLookup[tcId] = { status: 'Skip', remarks: 'Not executed' };
  }
}

const passRate = ((passedCount / (passedCount + failedCount || 1)) * 100).toFixed(2);

// Write dynamic lookup results for Python excel generator to read
fs.writeFileSync(
  path.join(resultsDir, 'Logs', 'test-results-lookup.json'),
  JSON.stringify(resultsLookup, null, 2)
);

// Run Python Excel report generator
try {
  console.log('Generating Excel sheet using python...');
  execSync('python generate_excel.py', { cwd: rootDir, stdio: 'inherit' });
} catch (err) {
  console.error('[ERROR] Failed to run generate_excel.py:', err.message);
}

// Write summary.md
const buildNum = process.env.GITHUB_RUN_NUMBER || 'Local-Run';
const runDate = new Date().toLocaleString();
const repoName = process.env.GITHUB_REPOSITORY ? process.env.GITHUB_REPOSITORY.split('/')[1] : 'Smart-Learn';
const userOwner = process.env.GITHUB_REPOSITORY ? process.env.GITHUB_REPOSITORY.split('/')[0] : 'Kethann143';

const summaryMd = `# Android Appium Test Summary

Build Number: #${buildNum}
Execution Date: ${runDate}

Total Tests: ${totalCount}
Passed: ${passedCount}
Failed: ${failedCount}
Pass Rate: ${passRate}%

Report URL:
https://${userOwner}.github.io/${repoName}/reports/latest/execution-report.html
`;

fs.writeFileSync(path.join(resultsDir, 'Summary', 'summary.md'), summaryMd);
console.log('[OK] Generated summary.md');

// Generate premium execution-report.html
const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Appium E2E Execution Report</title>
  <style>
    :root {
      --bg-dark: #0A081D;
      --bg-card: #13112E;
      --text-main: #E0E0FF;
      --text-muted: #8E8CAF;
      --primary: #00F2FE;
      --success: #00FF80;
      --fail: #FF4466;
      --warning: #FFAA00;
    }
    body {
      background-color: var(--bg-dark);
      color: var(--text-main);
      font-family: 'Segoe UI', system-ui, sans-serif;
      margin: 0;
      padding: 24px;
    }
    header {
      border-bottom: 2px solid #201D4C;
      padding-bottom: 16px;
      margin-bottom: 24px;
    }
    h1 { color: var(--primary); margin: 0; font-size: 2rem; }
    .metrics {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 16px;
      margin-bottom: 30px;
    }
    .metric-card {
      background-color: var(--bg-card);
      border: 1px solid #201D4C;
      border-radius: 8px;
      padding: 20px;
      text-align: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    }
    .metric-card.success { border-color: var(--success); }
    .metric-card.fail { border-color: var(--fail); }
    .metric-value { font-size: 2.2rem; font-weight: bold; margin-top: 8px; }
    .table-container {
      background-color: var(--bg-card);
      border-radius: 8px;
      padding: 16px;
      border: 1px solid #201D4C;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #201D4C;
    }
    th { color: var(--primary); font-weight: bold; }
    .status-badge {
      padding: 4px 8px;
      border-radius: 4px;
      font-weight: bold;
      font-size: 0.8rem;
    }
    .status-badge.pass { background-color: rgba(0,255,128,0.15); color: var(--success); }
    .status-badge.fail { background-color: rgba(255,68,102,0.15); color: var(--fail); }
    .status-badge.skip { background-color: rgba(255,170,0,0.15); color: var(--warning); }
    .error-log {
      font-family: Consolas, monospace;
      font-size: 0.8rem;
      background-color: #050410;
      padding: 8px;
      border-radius: 4px;
      color: #FFC0CB;
      margin-top: 4px;
    }
    .screenshot-link {
      color: var(--primary);
      text-decoration: none;
      font-size: 0.85rem;
    }
  </style>
</head>
<body>
  <header>
    <h1>📱 Smart Learn — Appium E2E Automation Report</h1>
    <p style="color: var(--text-muted); margin: 6px 0 0 0;">Build: #${buildNum} | Date: ${runDate}</p>
  </header>

  <section class="metrics">
    <div class="metric-card">
      <div style="color: var(--text-muted);">TOTAL TESTS</div>
      <div class="metric-value" style="color: var(--primary);">${totalCount}</div>
    </div>
    <div class="metric-card success">
      <div style="color: var(--success);">PASSED</div>
      <div class="metric-value" style="color: var(--success);">${passedCount}</div>
    </div>
    <div class="metric-card fail">
      <div style="color: var(--fail);">FAILED</div>
      <div class="metric-value" style="color: var(--fail);">${failedCount}</div>
    </div>
    <div class="metric-card">
      <div style="color: var(--warning);">SKIPPED</div>
      <div class="metric-value" style="color: var(--warning);">${skippedCount}</div>
    </div>
    <div class="metric-card">
      <div style="color: #B152FF;">PASS RATE</div>
      <div class="metric-value" style="color: #B152FF;">${passRate}%</div>
    </div>
  </section>

  <h2 style="color: var(--primary); margin-bottom: 12px;">Test Case Outcomes</h2>
  <div class="table-container">
    <table>
      <thead>
        <tr>
          <th style="width: 10%;">ID</th>
          <th style="width: 25%;">Module</th>
          <th style="width: 40%;">Title</th>
          <th style="width: 10%;">Status</th>
          <th style="width: 15%;">Artifacts / Errors</th>
        </tr>
      </thead>
      <tbody>
        ${Array.from({ length: totalCount }, (_, index) => {
          const i = index + 1;
          const tcId = `TC${String(i).padStart(3, '0')}`;
          const outcome = outcomes[tcId];
          let statusLabel = 'Skip';
          let statusClass = 'skip';
          let details = 'Not executed';
          
          if (outcome) {
            if (outcome.passed) {
              statusLabel = 'Pass';
              statusClass = 'pass';
              details = '';
            } else {
              statusLabel = 'Fail';
              statusClass = 'fail';
              details = `<div class="error-log">${outcome.error || 'Assertion failed'}</div>`;
              if (outcome.screenshot) {
                details += `<br><a class="screenshot-link" href="../Screenshots/${outcome.screenshot}" target="_blank">🖼️ View Screenshot</a>`;
              }
            }
          }
          
          // Fallback static modules naming context
          let module = 'Functional';
          if (i <= 40) module = 'Authentication';
          else if (i <= 75) module = 'Navigation';
          else if (i <= 115) module = 'Home';
          else if (i <= 165) module = 'Courses';
          else if (i <= 200) module = 'AI Tutor';
          else if (i <= 235) module = 'Progress';
          else if (i <= 270) module = 'Profile';
          else if (i <= 305) module = 'Settings';

          return `
            <tr>
              <td><strong>${tcId}</strong></td>
              <td><span style="color: #B152FF; font-weight: bold;">${module}</span></td>
              <td>UI/UX validation or functional run check</td>
              <td><span class="status-badge ${statusClass}">${statusLabel}</span></td>
              <td>${details}</td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>
  </div>
</body>
</html>
`;

fs.writeFileSync(path.join(resultsDir, 'HTML', 'execution-report.html'), htmlContent);
console.log('[OK] Generated execution-report.html');
