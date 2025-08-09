import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

export const getCreditCards = async (userId, filters = {}) => {
  let query = supabase.from('credit_cards_simplified').select('*');
  
  if (userId) {
    query = query.eq('user_id', userId);
  }
  
  const { data, error } = await query.order('created_at', { ascending: false });
  
  if (error) throw error;
  
  let filteredData = data || [];
  
  // Apply filters
  if (filters.card_name) {
    filteredData = filteredData.filter(card => {
      const cardName = (card.bank_name || '').toLowerCase();
      return cardName.includes(filters.card_name.toLowerCase());
    });
  }
  
  if (filters.inactive_only) {
    filteredData = filteredData.filter(card => {
      if (card.days_inactive && card.days_inactive > 90) return true;
      if (!card.last_used_date) return true;
      const daysSince = Math.floor((new Date() - new Date(card.last_used_date)) / (1000 * 60 * 60 * 24));
      return daysSince > 90;
    });
  }
  
  if (filters.promo_expiring) {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    filteredData = filteredData.filter(card => {
      if (!card.current_promos || !Array.isArray(card.current_promos)) return false;
      return card.current_promos.some(promo => {
        if (!promo.promo_expiry_date) return false;
        const expiryDate = new Date(promo.promo_expiry_date);
        return expiryDate <= thirtyDaysFromNow && expiryDate >= new Date();
      });
    });
  }
  
  return filteredData;
};