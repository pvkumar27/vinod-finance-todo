import * as chrono from 'chrono-node';

export const parseInput = (text) => {
  const input = text.toLowerCase().trim();
  
  // Parse dates from the input
  const parsedDates = chrono.parse(input);
  const extractedDate = parsedDates.length > 0 
    ? parsedDates[0].start.date().toISOString().split('T')[0]
    : new Date().toISOString().split('T')[0];

  // Expense patterns
  const expensePatterns = [
    /(?:add|log|spent?)\s*\$?(\d+(?:\.\d{2})?)\s*(?:for|to|on|as)?\s*([a-zA-Z\s]+?)(?:\s+(?:on|today|tomorrow|yesterday)|\s*$)/i,
    /\$(\d+(?:\.\d{2})?)\s*(?:for|to|on|as)\s*([a-zA-Z\s]+)/i
  ];

  // Todo patterns
  const todoPatterns = [
    /(?:create\s+(?:a\s+)?to-?do|add\s+task|remind\s+me\s+to):\s*(.+?)(?:\s+(?:on|by|tomorrow|today|next)|\s*$)/i,
    /(?:remind\s+me\s+to|need\s+to|todo)\s+(.+?)(?:\s+(?:on|by|tomorrow|today|next)|\s*$)/i
  ];

  // Credit card patterns
  const creditCardPatterns = [
    /add\s+credit\s+card:\s*([^,]+),?\s*(?:(\d+%?)\s*(?:until|till|expires?)\s*([a-zA-Z\s\d]+))?/i,
    /new\s+card:\s*([^,]+)/i
  ];

  // Reminder patterns
  const reminderPatterns = [
    /remind\s+me\s+to\s+pay\s+([a-zA-Z\s]+?)(?:\s+(?:on|by|card|next)|\s*$)/i,
    /pay\s+([a-zA-Z\s]+?)\s+(?:card|on|next|by)/i
  ];

  // Check for expense intent
  for (const pattern of expensePatterns) {
    const match = input.match(pattern);
    if (match) {
      const amount = parseFloat(match[1]);
      const category = match[2].trim();
      
      return {
        intent: 'add_expense',
        payload: {
          amount,
          category: mapCategory(category),
          date: extractedDate,
          description: `${category} expense`
        }
      };
    }
  }

  // Check for todo intent
  for (const pattern of todoPatterns) {
    const match = input.match(pattern);
    if (match) {
      return {
        intent: 'add_todo',
        payload: {
          task: match[1].trim(),
          due_date: extractedDate,
          notes: ''
        }
      };
    }
  }

  // Check for credit card intent
  for (const pattern of creditCardPatterns) {
    const match = input.match(pattern);
    if (match) {
      return {
        intent: 'add_credit_card',
        payload: {
          card_name: match[1].trim(),
          bank_name: extractBankName(match[1]),
          promo_end_date: match[3] ? parsePromoDate(match[3]) : null,
          bt_promo_available: match[2] && match[2].includes('0'),
          purchase_promo_available: match[2] && match[2].includes('0')
        }
      };
    }
  }

  // Check for reminder intent
  for (const pattern of reminderPatterns) {
    const match = input.match(pattern);
    if (match) {
      return {
        intent: 'reminder',
        payload: {
          card_name: match[1].trim(),
          due_date: extractedDate,
          task: `Pay ${match[1].trim()}`
        }
      };
    }
  }

  return {
    intent: 'unknown',
    payload: {
      original_text: text
    }
  };
};

// Helper functions
const mapCategory = (category) => {
  const categoryMap = {
    'groceries': 'Food',
    'food': 'Food',
    'gas': 'Transportation',
    'fuel': 'Transportation',
    'medicine': 'Healthcare',
    'medical': 'Healthcare',
    'shopping': 'Shopping',
    'entertainment': 'Entertainment',
    'bills': 'Bills',
    'utilities': 'Bills'
  };
  
  return categoryMap[category.toLowerCase()] || 'Other';
};

const extractBankName = (cardName) => {
  const bankMap = {
    'chase': 'Chase',
    'citi': 'Citi',
    'amex': 'American Express',
    'discover': 'Discover',
    'capital one': 'Capital One',
    'wells fargo': 'Wells Fargo',
    'bank of america': 'Bank of America'
  };
  
  const lowerCardName = cardName.toLowerCase();
  for (const [key, value] of Object.entries(bankMap)) {
    if (lowerCardName.includes(key)) {
      return value;
    }
  }
  
  return cardName.split(' ')[0]; // First word as bank name
};

const parsePromoDate = (dateStr) => {
  const parsed = chrono.parseDate(dateStr);
  return parsed ? parsed.toISOString().split('T')[0] : null;
};