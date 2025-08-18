#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Sanitize and validate file paths to prevent path traversal
const validatePath = (filePath, baseDir) => {
  const resolvedPath = path.resolve(filePath);
  const resolvedBase = path.resolve(baseDir);
  return resolvedPath.startsWith(resolvedBase + path.sep) || resolvedPath === resolvedBase;
};

// Scan components for data-cy attributes and update expectations
function updateTestExpectations() {
  const componentsDir = path.join(__dirname, '../src/components');
  const configPath = path.join(__dirname, '../cypress/config/content-expectations.json');

  const expectations = {};

  // Scan component files for data-cy attributes
  function scanFile(filePath) {
    // Validate path to prevent traversal attacks
    if (!validatePath(filePath, componentsDir)) {
      console.warn('Invalid file path detected, skipping:', filePath);
      return;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    // Compile regex once for better performance
    const dataCyRegex = /data-cy="([^"]+)"/g;
    const dataCyMatches = content.match(dataCyRegex);

    if (dataCyMatches) {
      dataCyMatches.forEach(match => {
        const attrMatch = dataCyRegex.exec(match);
        if (!attrMatch) return;
        
        const attr = attrMatch[1];
        // Make filter logic configurable
        if (attr && attr.includes('heading')) {
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
      
      // Validate path before processing
      if (!validatePath(filePath, componentsDir)) {
        console.warn('Invalid directory path detected, skipping:', filePath);
        return;
      }
      
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
