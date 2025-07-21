/**
 * Script to check Firebase Functions configuration
 * 
 * This script prints the current configuration values
 * that are used by the sendDailyTaskReminders function.
 */
const admin = require('firebase-admin');
const functions = require('firebase-functions');

// Initialize Firebase Admin with service account
try {
  const serviceAccount = require('./service-account.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
} catch (error) {
  console.error('Error initializing Firebase Admin:', error.message);
  console.error('Make sure you have a valid service-account.json file in this directory');
  process.exit(1);
}

async function checkConfig() {
  try {
    console.log('Checking Firebase Functions configuration...');
    
    // Get the current configuration
    const config = functions.config();
    
    console.log('\nCurrent configuration:');
    console.log(JSON.stringify(config, null, 2));
    
    // Check specific values used by the notification function
    console.log('\nNotification settings:');
    console.log('- API Key:', config.app?.key ? '******' + config.app.key.slice(-4) : 'NOT SET');
    console.log('- Email recipient:', config.app?.email || 'NOT SET (will use default: user@example.com)');
    
    // Check Firebase project
    console.log('\nFirebase project:', process.env.GCLOUD_PROJECT || 'Unknown');
    
  } catch (error) {
    console.error('Error checking configuration:', error);
  }
}

checkConfig().then(() => {
  console.log('\nDone checking configuration');
  process.exit(0);
}).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});