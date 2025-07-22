/**
 * Script to fix FCM token handling in the Cloud Function
 */
const fs = require('fs');
const path = require('path');

async function fixNotifications() {
  try {
    console.log('Fixing FCM token handling in Cloud Function...');
    
    // Read the index.js file
    const indexPath = path.join(__dirname, 'index.js');
    let content = fs.readFileSync(indexPath, 'utf8');
    
    // Replace the error handling code in both functions
    content = content.replace(
      /\/\/ If the token is invalid, remove it\s+if \(\s+sendError\.code === 'messaging\/invalid-registration-token' \|\|\s+sendError\.code === 'messaging\/registration-token-not-registered'\s+\) {/g,
      `// If the token is invalid, remove it
        if (
          sendError.code === 'messaging/invalid-registration-token' ||
          sendError.code === 'messaging/registration-token-not-registered' ||
          sendError.message.includes('Requested entity was not found')
        ) {`
    );
    
    // Write the updated content back to the file
    fs.writeFileSync(indexPath, content);
    
    console.log('Successfully updated error handling in Cloud Function');
    console.log('\nTo apply these changes:');
    console.log('1. Deploy the updated function: firebase deploy --only functions');
    console.log('2. Test the notification again');
    
  } catch (error) {
    console.error('Error fixing notifications:', error);
  }
}

fixNotifications().then(() => {
  console.log('Done fixing notifications');
  process.exit(0);
}).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});