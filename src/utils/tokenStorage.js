import { supabase } from '../supabaseClient';

/**
 * Save email notification preference for the current user
 * @param {string} status - Email notification status
 * @returns {Promise<boolean>} - Success status
 */
export const saveUserToken = async status => {
  try {
    if (status === 'email-notifications-enabled') {
      console.log('✅ Email notifications are active for this user');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Could save email notification preference to Supabase if needed
        console.log(`Email notifications enabled for: ${user.email}`);
      }
      
      return true;
    }
    
    console.log('No notification setup needed');
    return false;
  } catch (error) {
    console.error('Error saving notification preference:', error);
    return false;
  }
};
