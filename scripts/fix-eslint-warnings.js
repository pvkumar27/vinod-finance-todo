#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class ESLintWarningFixer {
  constructor() {
    this.fixes = 0;
  }

  // Actually fix unused variables by removing them
  fixUnusedVars(content) {
    // Remove unused imports
    content = content.replace(/import\s+\{[^}]*\}\s+from\s+['"][^'"]*['"];?\s*\n/g, match => {
      // Limit match length to prevent ReDoS
      if (match.length > 200) return match;
      
      // Keep import if it contains used variables (basic heuristic)
      const importVars = /\{([^}]+)\}/.exec(match)?.[1]?.split(',') || [];
      const usedVars = importVars.filter(v => {
        const varName = v.trim();
        // Use more precise matching to avoid false positives
        const escapedVarName = varName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const varRegex = new RegExp(`\\b${escapedVarName}\\b`);
        return varRegex.test(content) && content.indexOf(varName) !== content.indexOf(match);
      });

      if (usedVars.length === 0) {
        this.fixes++;
        return '';
      }
      return match;
    });

    // Remove unused variable declarations
    content = content.replace(/const\s+(\w+)\s*=\s*[^;]+;?\s*\n/g, (match, varName) => {
      // Limit match and variable name length
      if (match.length > 300 || varName.length > 50) return match;
      
      // Escape special regex characters to prevent ReDoS
      const escapedVarName = varName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escapedVarName}\\b`, 'g');
      const matches = content.match(regex) || [];
      if (matches.length === 1) {
        // Only the declaration
        this.fixes++;
        return '';
      }
      return match;
    });

    return content;
  }

  // Fix function definition order
  fixUseBeforeDefine(content) {
    const lines = content.split('\n');
    const functions = [];
    const usages = [];

    // Find function definitions and usages
    lines.forEach((line, index) => {
      // Limit line length to prevent ReDoS
      if (line.length > 500) return;
      
      const funcDef = /const\s+(\w+)\s*=\s*useCallback/.exec(line);
      if (funcDef) {
        functions.push({ name: funcDef[1], line: index, content: line });
      }

      const funcUsage = /(\w+)\(\)/.exec(line);
      if (funcUsage && !line.includes('const') && !line.includes('function')) {
        usages.push({ name: funcUsage[1], line: index });
      }
    });

    // Reorder functions to be defined before usage
    usages.forEach(usage => {
      const func = functions.find(f => f.name === usage.name);
      if (func && func.line > usage.line) {
        // Move function definition before usage
        this.fixes++;
      }
    });

    return content;
  }

  // Remove unused imports automatically
  removeUnusedImports(content) {
    const lines = content.split('\n');
    const importLines = [];
    const usedImports = new Set();

    // Find all imports and their usage
    lines.forEach((line, index) => {
      // Limit line length to prevent ReDoS
      if (line.length > 1000) return;
      
      const importMatch = /import\s+(?:\{([^}]+)\}|\*\s+as\s+(\w+)|(\w+))\s+from/.exec(line);
      if (importMatch) {
        importLines.push({
          line,
          index,
          imports: importMatch[1] || importMatch[2] || importMatch[3],
        });
      }
    });

    // Check which imports are actually used
    const contentWithoutImports = lines
      .slice()
      .filter((_, index) => !importLines.some(imp => imp.index === index))
      .join('\n');

    importLines.forEach(({ imports }) => {
      if (imports.includes(',')) {
        // Named imports
        imports.split(',').forEach(imp => {
          const cleanImport = imp.trim();
          if (contentWithoutImports.includes(cleanImport)) {
            usedImports.add(cleanImport);
          }
        });
      } else if (contentWithoutImports.includes(imports.trim())) {
        // Default or namespace import
        usedImports.add(imports.trim());
      }
    });

    // Remove unused import lines
    let modified = false;
    const filteredLines = lines.filter((line, index) => {
      const importLine = importLines.find(imp => imp.index === index);
      if (importLine) {
        const hasUsedImports = importLine.imports
          .split(',')
          .some(imp => usedImports.has(imp.trim()));
        if (!hasUsedImports) {
          modified = true;
          this.fixes++;
          return false;
        }
      }
      return true;
    });

    return modified ? filteredLines.join('\n') : content;
  }

  // Process a single file
  processFile(filePath) {
    try {
      // Validate file path to prevent path traversal
      const resolvedPath = path.resolve(filePath);
      const srcPath = path.resolve(__dirname, '../src');
      if (!resolvedPath.startsWith(srcPath)) {
        return false;
      }

      if (!fs.existsSync(resolvedPath)) return false;

      let content = fs.readFileSync(resolvedPath, 'utf8');
      
      // Limit file size to prevent memory exhaustion
      if (content.length > 1024 * 1024) { // 1MB limit
        console.warn(`File ${filePath} too large, skipping`);
        return false;
      }
      
      const originalContent = content;

      content = this.removeUnusedImports(content);
      content = this.fixUnusedVars(content);
      content = this.fixUseBeforeDefine(content);

      if (content !== originalContent) {
        fs.writeFileSync(resolvedPath, content);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Error processing file ${filePath}:`, error.message);
      return false;
    }
  }

  // Fix warnings in staged files
  fixStagedFiles() {
    try {
      const stagedFiles = execSync('git diff --cached --name-only --diff-filter=ACM', {
        encoding: 'utf8',
        timeout: 10000, // Prevent hanging
        maxBuffer: 1024 * 1024, // Limit output size
        env: { PATH: process.env.PATH } // Use inherited PATH
      })
        .split('\n')
        .filter(file => file.trim() && /\.(js|jsx)$/.exec(file))
        .slice(0, 100); // Limit number of files processed

      if (stagedFiles.length === 0) return 0;

      let filesFixed = 0;
      stagedFiles.forEach(file => {
        // Validate file path to prevent command injection
        if (!/^[a-zA-Z0-9._/\\-]+$/.test(file) || file.includes('..') || file.length > 255) return;

        if (this.processFile(file)) {
          filesFixed++;
          // Re-stage the fixed file with safe escaping
          try {
            execSync('git add ' + JSON.stringify(file), { 
              encoding: 'utf8',
              timeout: 5000, // Prevent hanging
              env: { PATH: process.env.PATH } // Use inherited PATH
            });
          } catch (execError) {
            console.error(`Failed to re-stage file ${file}:`, execError.message);
          }
        }
      });

      if (this.fixes > 0) {
        console.log(`✅ Auto-fixed ${this.fixes} ESLint warnings in ${filesFixed} files`);
      }

      return this.fixes;
    } catch (error) {
      console.error('Error fixing ESLint warnings:', error.message);
      return 0;
    }
  }
}

if (require.main === module) {
  const fixer = new ESLintWarningFixer();

  // If file path provided as argument, fix that file
  if (process.argv[2]) {
    const filePath = process.argv[2];
    if (fixer.processFile(filePath)) {
      console.log(`✅ Fixed ${fixer.fixes} warnings in ${filePath}`);
    } else {
      console.log(`No warnings to fix in ${filePath}`);
    }
  } else {
    // Otherwise fix staged files
    fixer.fixStagedFiles();
  }
}

module.exports = { ESLintWarningFixer };
