#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Scan components for data-cy attributes and update expectations
function updateTestExpectations() {
  const componentsDir = path.join(__dirname, '../src/components');
  const configPath = path.join(__dirname, '../cypress/config/content-expectations.json');

  const expectations = {};

  // Scan component files for data-cy attributes
  function scanFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const dataCyMatches = content.match(/data-cy="([^"]+)"/g);

    if (dataCyMatches) {
      dataCyMatches.forEach(match => {
        const attr = match.match(/data-cy="([^"]+)"/)[1];
        if (attr.includes('heading')) {
          const component = path.basename(filePath, '.js').toLowerCase();
          if (!expectations[component]) expectations[component] = {};
          expectations[component].dataCy = attr;
        }
      });
    }
  }

  // Scan all component files
  function scanDirectory(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      if (fs.statSync(filePath).isDirectory()) {
        scanDirectory(filePath);
      } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
        scanFile(filePath);
      }
    });
  }

  scanDirectory(componentsDir);

  // Update config file
  if (Object.keys(expectations).length > 0) {
    const existingConfig = fs.existsSync(configPath)
      ? JSON.parse(fs.readFileSync(configPath, 'utf8'))
      : {};

    const updatedConfig = { ...existingConfig, ...expectations };
    fs.writeFileSync(configPath, JSON.stringify(updatedConfig, null, 2));

    console.log(
      '✅ Updated test expectations with',
      Object.keys(expectations).length,
      'components'
    );
  }
}

if (require.main === module) {
  updateTestExpectations();
}

module.exports = { updateTestExpectations };
