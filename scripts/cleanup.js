/**
 * Repository Cleanup Script
 * 
 * This script moves obsolete and test files to an archive directory
 * to clean up the repository without deleting potentially useful code.
 * 
 * Note: Some test components are still referenced in the codebase and should not be moved.
 */
const fs = require('fs');
const path = require('path');

// Files to archive
const filesToArchive = [
  'functions/debug-tasks.js',
  'functions/detailed-test.js',
  'functions/simple-test.js',
  'functions/test-notification.js',
  'scripts/test-notification.js',
  'scripts/test-supabase.js',
  'scripts/test-restore.js',
  'src/components/CreditCardTest.js'
  // The following files are still referenced in the codebase and should not be moved:
  // 'src/components/ExpensesTest.js',
  // 'src/components/SupabaseTest.js',
  // 'src/components/ToDoTest.js'
];

// Create archive directory
const archiveDir = path.join(__dirname, '..', 'archive');
if (!fs.existsSync(archiveDir)) {
  fs.mkdirSync(archiveDir, { recursive: true });
  console.log('Created archive directory');
}

// Move files to archive
let movedCount = 0;
filesToArchive.forEach(filePath => {
  const fullPath = path.join(__dirname, '..', filePath);
  const fileName = path.basename(filePath);
  const targetPath = path.join(archiveDir, fileName);
  
  if (fs.existsSync(fullPath)) {
    try {
      fs.copyFileSync(fullPath, targetPath);
      fs.unlinkSync(fullPath);
      console.log(`✅ Moved ${filePath} to archive`);
      movedCount++;
    } catch (error) {
      console.error(`❌ Failed to move ${filePath}: ${error.message}`);
    }
  } else {
    console.log(`⚠️ File not found: ${filePath}`);
  }
});

console.log(`\n🧹 Cleanup complete! Moved ${movedCount} files to archive directory.`);