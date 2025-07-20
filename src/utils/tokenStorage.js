import { supabase } from '../supabaseClient';

/**
 * Save FCM token to Firestore for the current user
 * @param {string} token - FCM token
 * @returns {Promise<boolean>} - Success status
 */
export const saveUserToken = async token => {
  try {
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

    // Save token to Firestore using Firebase SDK
    // Since we're using Supabase for auth but Firebase for messaging,
    // we need to use the Firebase SDK directly for this operation
    const { initializeApp } = await import('firebase/app');
    const { getFirestore, collection, doc, setDoc } = await import('firebase/firestore');
    const { firebaseConfig } = await import('../firebase-config');

    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    // Save to userTokens collection with user ID as document ID
    await setDoc(doc(collection(db, 'userTokens'), user.id), {
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
