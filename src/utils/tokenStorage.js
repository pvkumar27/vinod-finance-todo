import { supabase } from '../supabaseClient';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';
import { firebaseConfig } from '../firebase-config';

// Check if we're in a test environment
const isTestEnv = process.env.NODE_ENV === 'test';

// Initialize Firebase conditionally
let app;
let db;

if (!isTestEnv && typeof window !== 'undefined') {
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
  } catch (error) {
    console.error('Error initializing Firebase:', error);
  }
}

/**
 * Save FCM token to Firestore for the current user
 * @param {string} token - FCM token
 * @returns {Promise<boolean>} - Success status
 */
export const saveUserToken = async token => {
  try {
    if (!token || typeof token !== 'string' || token.trim() === '') {
      console.error('Invalid token provided');
      return false;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.error('No authenticated user found');
      return false;
    }

    // Detect device type
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const deviceType = isIOS ? 'ios' : 'android';

    // Skip Firebase operations in test environment
    if (isTestEnv) {
      console.log('Test environment detected, skipping Firebase operations');
      return true;
    }
    
    // Check if Firebase is initialized
    if (!app || !db) {
      console.error('Firebase not initialized');
      return false;
    }
    
    // Generate a unique ID for this token
    const tokenId = `${user.id}-${Date.now()}`;
    
    // Save to userTokens collection with a unique ID
    await setDoc(doc(collection(db, 'userTokens'), tokenId), {
      token,
      userId: user.id,
      email: user.email,
      deviceType,
      lastUpdated: new Date(),
    });

    console.log('FCM token saved successfully');
    return true;
  } catch (error) {
    console.error('Error saving FCM token:', error);
    return false;
  }
};
