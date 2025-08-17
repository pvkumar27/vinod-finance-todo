#!/usr/bin/env node

const { execSync } = require('child_process');
const { SonarAutoFixer } = require('./fix-sonar-issues');

// Common SonarQube patterns to check
const sonarPatterns = [
  { pattern: /\w+\s*\?\s*[^:]+\s*:\s*\w+\s*\?\s*[^:]+\s*:/, message: 'Nested ternary detected' },
  { pattern: /\.sort\([^)]+\)\.slice\(/, message: 'Chained array operations detected' },
  { pattern: /\/\/\s*(TODO|FIXME|HACK)/, message: 'TODO comment detected' },
  { pattern: /placeholder/i, message: 'Placeholder comment detected' },
];

function checkStagedFiles() {
  try {
    // Get staged JS files
    const stagedFiles = execSync('git diff --cached --name-only --diff-filter=ACM', {
      encoding: 'utf8',
    })
      .split('\n')
      .filter(file => file.match(/\.(js|jsx)$/));

    if (stagedFiles.length === 0) return true;

    let issuesFound = 0;
    const issueFiles = [];

    stagedFiles.forEach(file => {
      // Validate file path to prevent path traversal
      if (!/^[a-zA-Z0-9._/-]+$/.test(file)) return;

      try {
        const content = require('fs').readFileSync(file, 'utf8');

        sonarPatterns.forEach(({ pattern, message }) => {
          if (pattern.test(content)) {
            console.log(`⚠️  ${file}: ${message}`);
            issuesFound++;
            if (!issueFiles.includes(file)) issueFiles.push(file);
          }
        });
      } catch (error) {
        // File might be deleted, skip
      }
    });

    if (issuesFound > 0) {
      console.log(`\n🔧 Auto-fixing ${issuesFound} SonarQube issues...`);

      const fixer = new SonarAutoFixer();
      issueFiles.forEach(file => fixer.processFile(file));

      // Re-stage fixed files with safe command construction
      if (issueFiles.length > 0) {
        const safeFiles = issueFiles.map(f => JSON.stringify(f)).join(' ');
        execSync(`git add ${safeFiles}`, { encoding: 'utf8' });
        console.log('✅ Issues fixed and re-staged');
      }
    }

    return true;
  } catch (error) {
    console.error('Error checking SonarQube issues:', error.message);
    return false;
  }
}

if (require.main === module) {
  const success = checkStagedFiles();
  process.exit(success ? 0 : 1);
}

module.exports = { checkStagedFiles };
