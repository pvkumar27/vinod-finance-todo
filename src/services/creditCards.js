import { supabase } from '../supabaseClient';

const validateCardData = cardData => {
  const sanitized = {
    bank_name: (cardData.bank_name || '').trim().substring(0, 100),
    last_four_digits: (cardData.last_four_digits || '').replace(/\D/g, '').substring(0, 4),
    card_type: (cardData.card_type || '').trim().substring(0, 100),
    card_holder: (cardData.card_holder || '').trim().substring(0, 100),
    days_inactive: parseInt(cardData.days_inactive) || null,
    last_used_date: cardData.last_used_date || null,
    promo_used: Boolean(cardData.promo_used),
    promo_end_date: cardData.promo_end_date || null,
    interest_after_promo: cardData.interest_after_promo
      ? parseFloat(cardData.interest_after_promo)
      : null,
    new_promo_available: Boolean(cardData.new_promo_available),
    current_promos: Array.isArray(cardData.current_promos) ? cardData.current_promos : [],
    notes: (cardData.notes || '').trim().substring(0, 1000),
  };

  if (!sanitized.bank_name || !sanitized.last_four_digits) {
    throw new Error('Bank name and last four digits are required');
  }

  return sanitized;
};

export const getCreditCards = async () => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('credit_cards_simplified')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch credit cards: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error('Error in getCreditCards:', error);
    throw error;
  }
};

export const addCreditCard = async cardData => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const validatedData = validateCardData(cardData);
    validatedData.user_id = user.id;

    const { data, error } = await supabase
      .from('credit_cards_simplified')
      .insert([validatedData])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to add credit card: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error in addCreditCard:', error);
    throw error;
  }
};

export const updateCreditCard = async (id, updates) => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    if (!id) {
      throw new Error('Credit card ID is required');
    }

    const validatedUpdates = validateCardData(updates);

    const { data, error } = await supabase
      .from('credit_cards_simplified')
      .update(validatedUpdates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update credit card: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error in updateCreditCard:', error);
    throw error;
  }
};

export const deleteCreditCard = async id => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    if (!id) {
      throw new Error('Credit card ID is required');
    }

    const { error } = await supabase
      .from('credit_cards_simplified')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      throw new Error(`Failed to delete credit card: ${error.message}`);
    }

    return true;
  } catch (error) {
    console.error('Error in deleteCreditCard:', error);
    throw error;
  }
};

export const isCardInactive = lastTransactionDate => {
  if (!lastTransactionDate) return true;

  try {
    const lastDate = new Date(lastTransactionDate);
    const today = new Date();
    const daysDiff = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));

    return daysDiff > 90;
  } catch (error) {
    console.error('Error calculating card inactivity:', error);
    return true;
  }
};

export const getCreditCardById = async id => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    if (!id) {
      throw new Error('Credit card ID is required');
    }

    const { data, error } = await supabase
      .from('credit_cards_simplified')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      throw new Error(`Failed to fetch credit card: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error in getCreditCardById:', error);
    throw error;
  }
};
