import { supabase } from '../supabaseClient';

/**
 * Save FCM token to Supabase for the current user
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

    // Save to user_tokens table in Supabase
    const { error } = await supabase.from('user_tokens').upsert(
      {
        user_id: user.id,
        token,
        email: user.email,
        device_type: deviceType,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'user_id,token',
      }
    );

    if (error) {
      console.error('Error saving FCM token to Supabase:', error);
      return false;
    }

    console.log('FCM token saved successfully to Supabase');
    return true;
  } catch (error) {
    console.error('Error saving FCM token:', error);
    return false;
  }
};
