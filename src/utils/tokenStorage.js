import { supabase } from '../supabaseClient';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';
import { firebaseConfig } from '../firebase-config';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

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
