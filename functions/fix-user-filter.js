/**
 * Script to update the Cloud Function to filter tasks by user ID
 */
const fs = require('fs');
const path = require('path');

// Path to the index.js file
const indexPath = path.join(__dirname, 'index.js');

// Read the current file
let content = fs.readFileSync(indexPath, 'utf8');

// Find the query section
const queryRegex = /\/\/ Query for incomplete tasks due today or earlier[\s\S]*?\.get\(\);/;

// New query that includes user ID filter
const newQuery = `// Query for incomplete tasks due today or earlier
    // Get the user ID from the config
    const userId = functions.config().app.user_id || 'pvkumar27@gmail.com';
    console.log(\`Filtering tasks for user: \${userId}\`);
    
    const tasksSnapshot = await db
      .collection('todos')
      .where('userId', '==', userId)
      .where('completed', '==', false)
      .where('dueDate', '<=', endTimestamp)
      .get();
      
    console.log(\`Searching for tasks due on or before \${endTimestamp.toDate().toISOString()}\`);`;

// Replace the query
const updatedContent = content.replace(queryRegex, newQuery);

// Write the updated content back to the file
fs.writeFileSync(indexPath, updatedContent);

console.log('✅ Updated index.js to filter tasks by user ID!');
console.log('\nTo set the user ID in the config:');
console.log('firebase functions:config:set app.user_id="pvkumar27@gmail.com"');
console.log('\nTo deploy the updated function:');
console.log('firebase deploy --only functions');