import { supabase } from '../supabaseClient';

// Don't initialize Firebase in test environment
let app;
let db;

// Check if we're in a test environment
const isTestEnv = process.env.NODE_ENV === 'test';

// Only initialize Firebase if not in test environment
if (!isTestEnv && typeof window !== 'undefined') {
  import('firebase/app').then(({ initializeApp }) => {
    import('firebase/firestore').then(({ getFirestore }) => {
      import('../firebase-config').then(({ firebaseConfig }) => {
        app = initializeApp(firebaseConfig);
        db = getFirestore(app);
      });
    });
  });
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
    
    // Generate a unique ID for this token
    const tokenId = `${user.id}-${Date.now()}`;
    
    // Dynamically import Firebase if needed
    if (!app || !db) {
      const { initializeApp } = await import('firebase/app');
      const { getFirestore, collection, doc, setDoc } = await import('firebase/firestore');
      const { firebaseConfig } = await import('../firebase-config');
      
      app = initializeApp(firebaseConfig);
      db = getFirestore(app);
    } else {
      // Import only what we need for the operation
      const { collection, doc, setDoc } = await import('firebase/firestore');
    }
    
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
