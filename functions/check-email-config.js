/**
 * Script to check email configuration and logs
 * 
 * This script simulates what happens in the Cloud Function
 * to help diagnose email notification issues.
 */
const fs = require('fs');
const path = require('path');

// Check if service account file exists
const serviceAccountPath = path.join(__dirname, 'service-account.json');
if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ service-account.json not found!');
  console.error('');
  console.error('To use this script:');
  console.error('1. Go to Firebase Console > Project Settings > Service Accounts');
  console.error('2. Click "Generate new private key"');
  console.error('3. Save the file as "service-account.json" in the functions directory');
  process.exit(1);
}

// Initialize Firebase Admin
const admin = require('firebase-admin');
const serviceAccount = require('./service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function checkEmailConfig() {
  try {
    console.log('🔍 Checking email configuration and logs...');
    
    // Get Firestore instance
    const db = admin.firestore();
    
    // Check if 'mail' collection exists
    const collections = await db.listCollections();
    const collectionNames = collections.map(col => col.id);
    
    console.log('\n📋 Available collections:');
    console.log(collectionNames.join(', '));
    
    if (!collectionNames.includes('mail')) {
      console.error('\n❌ The "mail" collection does not exist!');
      console.error('This suggests the Firebase Extension: Trigger Email is not installed.');
      console.error('Please install it from the Firebase Console > Extensions.');
    } else {
      console.log('\n✅ "mail" collection exists - Trigger Email extension is likely installed.');
      
      // Check recent emails
      console.log('\n📧 Recent emails sent (last 10):');
      const emailsSnapshot = await db.collection('mail').orderBy('created', 'desc').limit(10).get();
      
      if (emailsSnapshot.empty) {
        console.log('No emails found in the mail collection.');
      } else {
        emailsSnapshot.forEach(doc => {
          const data = doc.data();
          console.log(`- To: ${data.to}, Subject: ${data.message?.subject || 'No subject'}, Status: ${data.delivery?.state || 'unknown'}`);
          if (data.delivery?.error) {
            console.log(`  Error: ${data.delivery.error}`);
          }
        });
      }
    }
    
    // Check userTokens collection for push notifications
    if (collectionNames.includes('userTokens')) {
      console.log('\n📱 Device tokens for push notifications:');
      const tokensSnapshot = await db.collection('userTokens').get();
      
      if (tokensSnapshot.empty) {
        console.log('No device tokens found - push notifications cannot be sent.');
      } else {
        console.log(`Found ${tokensSnapshot.size} device tokens.`);
      }
    } else {
      console.log('\n⚠️ No "userTokens" collection found - push notifications cannot be sent.');
    }
    
    // Check todos collection
    if (collectionNames.includes('todos')) {
      console.log('\n📝 Recent todos (last 5):');
      const todosSnapshot = await db.collection('todos').orderBy('created_at', 'desc').limit(5).get();
      
      if (todosSnapshot.empty) {
        console.log('No todos found.');
      } else {
        todosSnapshot.forEach(doc => {
          const data = doc.data();
          const dueDate = data.dueDate ? data.dueDate.toDate().toISOString() : 'No due date';
          console.log(`- Task: ${data.task || data.title || 'Untitled'}, Due: ${dueDate}, Completed: ${data.completed}`);
        });
      }
    }
    
    console.log('\n📋 Environment variables:');
    console.log('- GCLOUD_PROJECT:', process.env.GCLOUD_PROJECT || 'Not set');
    
    console.log('\n⚠️ Note: This script cannot access Firebase Functions configuration.');
    console.log('To check the email configuration, run:');
    console.log('firebase functions:config:get');
    
  } catch (error) {
    console.error('\n❌ Error checking configuration:', error);
  }
}

checkEmailConfig().then(() => {
  console.log('\n✅ Check complete');
  process.exit(0);
}).catch(err => {
  console.error('\n❌ Fatal error:', err);
  process.exit(1);
});