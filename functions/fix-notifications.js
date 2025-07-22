/**
 * Fix Notifications Script
 * 
 * This script is used to fix notification issues in the FinTask application.
 * It handles token validation, notification delivery, and ensures proper
 * message formatting for push notifications.
 */

const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');

// Initialize Firebase if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = getFirestore();

/**
 * Fix notification tokens and delivery issues
 * @param {Object} options Configuration options
 * @param {boolean} options.dryRun Whether to run in dry-run mode (no changes)
 * @param {boolean} options.verbose Whether to log verbose output
 * @returns {Promise<Object>} Results of the fix operation
 */
async function fixNotifications(options = { dryRun: true, verbose: false }) {
  const { dryRun, verbose } = options;
  const results = {
    processed: 0,
    fixed: 0,
    errors: 0,
    details: []
  };

  try {
    console.log(`Starting notification fix ${dryRun ? '(DRY RUN)' : ''}`);
    
    // Get all user tokens
    const tokensSnapshot = await db.collection('fcmTokens').get();
    
    if (tokensSnapshot.empty) {
      console.log('No tokens found to process');
      return results;
    }
    
    // Process each token
    for (const doc of tokensSnapshot.docs) {
      const tokenData = doc.data();
      results.processed++;
      
      try {
        // Validate token format
        if (!tokenData.token || typeof tokenData.token !== 'string' || tokenData.token.length < 100) {
          if (verbose) console.log(`Invalid token format for ${doc.id}`);
          
          if (!dryRun) {
            // Mark invalid token
            await doc.ref.update({
              valid: false,
              lastChecked: admin.firestore.FieldValue.serverTimestamp(),
              error: 'Invalid token format'
            });
          }
          
          results.fixed++;
          results.details.push({
            id: doc.id,
            action: 'marked-invalid',
            reason: 'Invalid token format'
          });
          continue;
        }
        
        // Check token validity with Firebase
        try {
          if (!dryRun) {
            // Send test message to validate token
            await admin.messaging().send({
              token: tokenData.token,
              data: {
                type: 'TOKEN_VALIDATION',
                timestamp: Date.now().toString()
              },
              android: {
                priority: 'high',
                ttl: 60 * 1000 // 1 minute
              },
              apns: {
                headers: {
                  'apns-priority': '10',
                  'apns-expiration': Math.floor(Date.now() / 1000) + 60
                }
              }
            }, true); // validateOnly=true
            
            // Update token status
            await doc.ref.update({
              valid: true,
              lastChecked: admin.firestore.FieldValue.serverTimestamp(),
              error: null
            });
          }
          
          if (verbose) console.log(`Token ${doc.id} is valid`);
          results.details.push({
            id: doc.id,
            action: 'validated',
            status: 'valid'
          });
        } catch (fcmError) {
          if (verbose) console.log(`Token ${doc.id} is invalid: ${fcmError.message}`);
          
          if (!dryRun) {
            // Mark token as invalid
            await doc.ref.update({
              valid: false,
              lastChecked: admin.firestore.FieldValue.serverTimestamp(),
              error: fcmError.message
            });
          }
          
          results.fixed++;
          results.details.push({
            id: doc.id,
            action: 'marked-invalid',
            reason: fcmError.message
          });
        }
      } catch (error) {
        console.error(`Error processing token ${doc.id}:`, error);
        results.errors++;
        results.details.push({
          id: doc.id,
          action: 'error',
          error: error.message
        });
      }
    }
    
    console.log(`Notification fix completed: ${results.processed} processed, ${results.fixed} fixed, ${results.errors} errors`);
    return results;
  } catch (error) {
    console.error('Error in fixNotifications:', error);
    results.errors++;
    throw error;
  }
}

module.exports = { fixNotifications };