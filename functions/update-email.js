/**
 * Script to update the email address for notifications
 * 
 * Usage: node update-email.js your-email@example.com
 */
const { execSync } = require('child_process');

// Get the email from command line arguments
const email = process.argv[2];

if (!email || !email.includes('@')) {
  console.error('Please provide a valid email address');
  console.error('Usage: node update-email.js your-email@example.com');
  process.exit(1);
}

try {
  console.log(`Setting notification email to: ${email}`);
  
  // Update the Firebase Functions configuration
  execSync(`firebase functions:config:set app.email="${email}"`, { stdio: 'inherit' });
  
  console.log('\nEmail configuration updated successfully!');
  console.log('\nRemember to deploy the functions for the changes to take effect:');
  console.log('firebase deploy --only functions');
  
} catch (error) {
  console.error('Error updating email configuration:', error.message);
  process.exit(1);
}