/**
 * Script to deploy the fix for truncated FCM token
 */
const { execSync } = require('child_process');

try {
  // Deploy the functions
  console.log('Deploying functions...');
  execSync('firebase deploy --only functions --project finance-to-dos', { stdio: 'inherit' });
  
  // Run the fix script
  console.log('\nRunning fix for truncated token...');
  execSync('firebase functions:shell', { 
    input: 'fixTruncatedToken()', 
    stdio: 'inherit' 
  });
  
  console.log('\nFix deployed and executed successfully');
} catch (error) {
  console.error('Error deploying fix:', error.message);
  process.exit(1);
}