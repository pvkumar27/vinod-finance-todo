/**
 * Debug script to check email configuration
 */
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const serviceAccount = require('./service-account.json');

// Initialize Firebase Admin with service account
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

async function debugEmail() {
  try {
    console.log('Checking email configuration...');

    // Load Firebase Functions config
    const config = functions.config();
    console.log('App email config:', config.app ? config.app.email : 'Not configured');

    // Test sending an email
    console.log('\nAttempting to send a test email...');
    const db = admin.firestore();

    await db.collection('mail').add({
      to: config.app ? config.app.email : 'user@example.com',
      message: {
        subject: '🔧 FinTask Email Test',
        html: `
          <h2>FinTask Email Test</h2>
          <p>This is a test email to verify that the email functionality is working.</p>
          <p>Time sent: ${new Date().toISOString()}</p>
        `,
        text: `FinTask Email Test\n\nThis is a test email to verify that the email functionality is working.\n\nTime sent: ${new Date().toISOString()}`,
      },
    });

    console.log('Test email sent successfully');
  } catch (error) {
    console.error('Error testing email:', error);
  }
}

debugEmail()
  .then(() => {
    console.log('\nEmail debug complete');
    process.exit(0);
  })
  .catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
