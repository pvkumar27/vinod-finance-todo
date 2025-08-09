import { supabase } from '../supabaseClient';

// Single API layer that both React app and AI assistant use
export const api = {
  // Todos
  async getTodos(filters = {}) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    let query = supabase.from('todos').select('*');
    query = query.eq('user_id', user.id);
    
    if (filters.completed !== undefined) {
      query = query.eq('completed', filters.completed);
    }
    if (filters.priority) {
      query = query.eq('priority', filters.priority);
    }
    if (filters.due_date) {
      query = query.eq('due_date', filters.due_date);
    }
    if (filters.no_due_date) {
      query = query.is('due_date', null);
    }
    
    query = query.order('created_at', { ascending: false });
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async addTodo(todoData) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('todos')
      .insert([{ ...todoData, user_id: user.id }])
      .select();
    if (error) throw error;
    return data[0];
  },

  async updateTodo(id, updates) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('todos')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select();
    if (error) throw error;
    return data[0];
  },

  async deleteTodo(id) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);
    if (error) throw error;
    return { success: true };
  },

  async addCreditCard(cardData) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('credit_cards_simplified')
      .insert({ ...cardData, user_id: user.id })
      .select();
    if (error) throw error;
    return data[0];
  },

  async updateCreditCard(id, updates) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('credit_cards_simplified')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select();
    if (error) throw error;
    return data[0];
  },

  async deleteCreditCard(id) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('credit_cards_simplified')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);
    if (error) throw error;
    return { success: true };
  },

  // Credit Cards
  async getCreditCards(filters = {}) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    let query = supabase.from('credit_cards_simplified').select('*');
    query = query.eq('user_id', user.id);
    
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    
    let filteredData = data || [];
    
    if (filters.card_name) {
      filteredData = filteredData.filter(card => 
        (card.bank_name || '').toLowerCase().includes(filters.card_name.toLowerCase())
      );
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
  }
};