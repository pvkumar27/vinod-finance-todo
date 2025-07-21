/**
 * Script to deploy the updated function
 * 
 * This script:
 * 1. Updates the index.js file to include overdue tasks
 * 2. Provides instructions for deploying the function
 */
const fs = require('fs');
const path = require('path');

// Path to the index.js file
const indexPath = path.join(__dirname, 'index.js');

// Check if index.js exists
if (!fs.existsSync(indexPath)) {
  console.error('❌ index.js not found!');
  console.error('Make sure you are in the functions directory.');
  process.exit(1);
}

// Read the current file
let content = fs.readFileSync(indexPath, 'utf8');

// Check if the file already includes the fix
if (content.includes('.where(\'dueDate\', \'<=\', endTimestamp)')) {
  console.log('✅ The function already includes the fix for overdue tasks!');
  console.log('To deploy the function:');
  console.log('firebase deploy --only functions');
  process.exit(0);
}

// Find the query section
const queryRegex = /\/\/ Query for incomplete tasks[\s\S]*?\.get\(\);/;

// New query that includes overdue tasks
const newQuery = `// Query for incomplete tasks due today or earlier
    const tasksSnapshot = await db
      .collection('todos')
      .where('completed', '==', false)
      .where('dueDate', '<=', endTimestamp)
      .get();
      
    console.log(\`Searching for tasks due on or before \${endTimestamp.toDate().toISOString()}\`);`;

// Replace the query
const updatedContent = content.replace(queryRegex, newQuery);

// Update the email subject and body
const updatedContent2 = updatedContent
  .replace('📝 Your FinTask To-Dos for Today', '📝 Your FinTask To-Dos: Due Today & Overdue')
  .replace('You have ${tasks.length} pending task(s) for today', 'You have ${tasks.length} pending task(s) that need attention');

// Write the updated content back to the file
fs.writeFileSync(indexPath, updatedContent2);

console.log('✅ Updated index.js to include overdue tasks!');
console.log('\nTo deploy the updated function:');
console.log('1. Make sure you are logged in to Firebase:');
console.log('   firebase login');
console.log('2. Deploy the function:');
console.log('   firebase deploy --only functions');
console.log('\nAfter deploying, test the function:');
console.log('node simple-test.js');