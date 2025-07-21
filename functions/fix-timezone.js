/**
 * Fix for timezone issue in the sendDailyTaskReminders function
 *
 * This script updates the Cloud Function to use the correct timezone
 * when determining "today's" tasks.
 */
const fs = require('fs');
const path = require('path');

// Path to the index.js file
const indexPath = path.join(__dirname, 'index.js');

// Read the current file
let content = fs.readFileSync(indexPath, 'utf8');

// Find the date range calculation section
const dateRangeRegex =
  /\/\/ Get current date range \(today\)[\s\S]*?endOfDay\.setHours\(23, 59, 59, 999\);/;

// New date range calculation with timezone handling
const newDateRange = `// Get current date range (today)
    // Use Central Time (America/Chicago) for consistency with the 8:00 AM CT schedule
    const now = new Date();
    // Convert to CT (UTC-6 or UTC-5 depending on DST)
    const centralTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Chicago' }));
    console.log('Current time (CT):', centralTime.toISOString());
    
    const startOfDay = new Date(centralTime);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(centralTime);
    endOfDay.setHours(23, 59, 59, 999);`;

// Replace the date range calculation
const updatedContent = content.replace(dateRangeRegex, newDateRange);

// Add logging for debugging
const updatedContentWithLogging = updatedContent.replace(
  /const tasksSnapshot = await db[\s\S]*?\.get\(\);/,
  `const tasksSnapshot = await db
      .collection('todos')
      .where('completed', '==', false)
      .where('dueDate', '>=', startTimestamp)
      .where('dueDate', '<=', endTimestamp)
      .get();
      
    console.log(\`Searching for tasks between \${startTimestamp.toDate().toISOString()} and \${endTimestamp.toDate().toISOString()}\`);`
);

// Write the updated content back to the file
fs.writeFileSync(indexPath, updatedContentWithLogging);

console.log('Updated index.js with timezone fix');
console.log('Remember to deploy the updated function with: npm run deploy');
