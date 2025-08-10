import { supabase } from '../supabaseClient';

// Single API layer that both React app and AI assistant use
export const api = {
  // Todos
  async getTodos(filters = {}) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
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
    if (filters.due_date_before) {
      const dateStr =
        typeof filters.due_date_before === 'string'
          ? filters.due_date_before
          : filters.due_date_before.toISOString().split('T')[0];
      query = query.lte('due_date', dateStr);
    }
    if (filters.no_due_date) {
      query = query.is('due_date', null);
    }
    if (filters.pinned !== undefined) {
      query = query.eq('pinned', filters.pinned);
    }

    // Use the same ordering as the old todos service
    query = query
      .order('pinned', { ascending: false })
      .order('sort_order', { ascending: true, nullsLast: true })
      .order('created_at', { ascending: false });

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async addTodo(todoData) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Get the highest sort_order value
    const { data: maxOrderData } = await supabase
      .from('todos')
      .select('sort_order')
      .order('sort_order', { ascending: false })
      .limit(1);

    const nextOrder =
      maxOrderData && maxOrderData.length > 0 && maxOrderData[0].sort_order
        ? maxOrderData[0].sort_order + 1
        : 1;

    const dbData = {
      user_id: user.id,
      task: todoData.task,
      due_date: todoData.due_date || new Date().toISOString().split('T')[0],
      sort_order: nextOrder,
      pinned: todoData.pinned || false,
    };

    const { data, error } = await supabase.from('todos').insert([dbData]).select();
    if (error) throw error;
    return data[0];
  },

  async updateTodo(id, updates) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
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
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase.from('todos').delete().eq('id', id).eq('user_id', user.id);
    if (error) throw error;
    return { success: true };
  },

  async addCreditCard(cardData) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('credit_cards_simplified')
      .insert({ ...cardData, user_id: user.id })
      .select();
    if (error) throw error;
    return data[0];
  },

  async updateCreditCard(id, updates) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
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
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('credit_cards_simplified')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);
    if (error) throw error;
    return { success: true };
  },

  async updateTodoOrder(todos) {
    // Process each todo one by one to avoid null task error
    for (let i = 0; i < todos.length; i++) {
      const { error } = await supabase
        .from('todos')
        .update({ sort_order: i + 1 })
        .eq('id', todos[i].id);

      if (error) throw error;
    }
  },

  // Credit Cards
  async getCreditCards(filters = {}) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
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

    if (filters.bank_name) {
      filteredData = filteredData.filter(card =>
        (card.bank_name || '').toLowerCase().includes(filters.bank_name.toLowerCase())
      );
    }

    if (filters.inactive_only) {
      filteredData = filteredData.filter(card => {
        if (card.days_inactive && card.days_inactive > 90) return true;
        if (!card.last_used_date) return true;
        const daysSince = Math.floor(
          (new Date() - new Date(card.last_used_date)) / (1000 * 60 * 60 * 24)
        );
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

    // Apply sorting
    if (filters.sort_by) {
      filteredData.sort((a, b) => {
        let aVal, bVal;

        switch (filters.sort_by) {
          case 'name':
          case 'bank_name':
            aVal = (a.bank_name || '').toLowerCase();
            bVal = (b.bank_name || '').toLowerCase();
            break;
          case 'days_inactive':
            aVal = a.last_used_date
              ? Math.floor((new Date() - new Date(a.last_used_date)) / (1000 * 60 * 60 * 24))
              : 999999;
            bVal = b.last_used_date
              ? Math.floor((new Date() - new Date(b.last_used_date)) / (1000 * 60 * 60 * 24))
              : 999999;
            break;
          case 'last_used':
            aVal = a.last_used_date ? new Date(a.last_used_date) : new Date(0);
            bVal = b.last_used_date ? new Date(b.last_used_date) : new Date(0);
            break;
          case 'card_type':
            aVal = (a.card_type || '').toLowerCase();
            bVal = (b.card_type || '').toLowerCase();
            break;
          default:
            return 0;
        }

        if (aVal < bVal) return filters.sort_order === 'desc' ? 1 : -1;
        if (aVal > bVal) return filters.sort_order === 'desc' ? -1 : 1;
        return 0;
      });
    }

    return filteredData;
  },

  async getCreditCardById(id) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('credit_cards_simplified')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();
    if (error) throw error;
    return data;
  },
};
