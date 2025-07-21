/**
 * Script to set email configuration for notifications
 * 
 * This script creates a temporary Firebase project configuration
 * that you can use to update your actual Firebase project.
 * 
 * Usage: node set-email-config.js your-email@example.com
 */

// Get the email from command line arguments
const email = process.argv[2];

if (!email || !email.includes('@')) {
  console.error('❌ Please provide a valid email address');
  console.error('Usage: node set-email-config.js your-email@example.com');
  process.exit(1);
}

// Create the configuration commands
console.log(`\n📧 Setting notification email to: ${email}\n`);

console.log('Run these commands in your terminal:');
console.log('----------------------------------');
console.log(`firebase functions:config:set app.email="${email}"`);
console.log('firebase deploy --only functions');
console.log('----------------------------------');

console.log('\nAfter running these commands, your notifications will be sent to:');
console.log(email);

console.log('\nTo verify the configuration was set correctly, run:');
console.log('firebase functions:config:get');

console.log('\nTo test the notification function, run:');
console.log('firebase functions:shell');
console.log('sendDailyTaskReminders({query: {key: "YOUR_API_KEY", sendPush: "true"}})');