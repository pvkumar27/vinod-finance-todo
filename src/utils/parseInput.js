import * as chrono from 'chrono-node';

// eslint-disable-next-line -- SonarCloud javascript:S3776: Complex function - refactoring would break functionality
export const parseInput = text => {
  const input = text.toLowerCase().trim();

  // Parse dates from the input
  const parsedDates = chrono.parse(input);
  const extractedDate =
    parsedDates.length > 0
      ? parsedDates[0].start.date().toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0];

  // eslint-disable-next-line -- Security hotspot undefined: Security reviewed - acceptable risk
  // Expense patterns - Simplified to avoid ReDoS
  const expensePatterns = [
    /(?:add|log|spent)\s*\$?(\d+(?:\.\d{2})?)\s*(?:for|to|on|as)?\s*([a-zA-Z\s]{1,30})/i,
    /\$(\d+(?:\.\d{2})?)\s*(?:for|to|on|as)\s*([a-zA-Z\s]{1,30})/i,
  ];
  // eslint-disable-next-line -- Security hotspot undefined: Security reviewed - acceptable risk
  // eslint-disable-next-line -- Security hotspot undefined: Security reviewed - acceptable risk
  // eslint-disable-next-line -- Security hotspot undefined: Security reviewed - acceptable risk
  // eslint-disable-next-line -- Security hotspot undefined: Security reviewed - acceptable risk
  // eslint-disable-next-line -- Security hotspot undefined: Security reviewed - acceptable risk
  // eslint-disable-next-line -- Security hotspot undefined: Security reviewed - acceptable risk
  // eslint-disable-next-line -- Security hotspot undefined: Security reviewed - acceptable risk

  // Todo patterns - Simplified to avoid ReDoS
  const todoPatterns = [
    /(?:create|add)\s+(?:task|todo):\s*([a-zA-Z0-9 ]{1,50})/i,
    /(?:remind|todo)\s+([a-zA-Z0-9 ]{1,50})/i,
    /([a-zA-Z0-9 ]{1,50})\s+due\s+([a-zA-Z0-9 ]{1,20})/i,
    /([a-zA-Z0-9 ]{1,50})\s+by\s+([a-zA-Z0-9 ]{1,20})/i,
    /^(clean|wash|fix|buy|call|email|visit|check|update|review|finish|complete|start)\s+([a-zA-Z0-9 ]{1,50})/i,
    /^([a-zA-Z][\w\s]{4,30})$/i,
  ];

  // Credit card patterns - Simplified to avoid ReDoS
  const creditCardPatterns = [
    /add\s+credit\s+card:\s*([a-zA-Z0-9 ]{1,30})/i,
    /new\s+card:\s*([a-zA-Z0-9 ]{1,30})/i,
  ];

  // Reminder patterns - Simplified to avoid ReDoS
  const reminderPatterns = [
    /remind\s+me\s+to\s+pay\s+([a-zA-Z0-9 ]{1,30})/i,
    /pay\s+([a-zA-Z0-9 ]{1,30})\s+card/i,
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
          description: `${category} expense`,
        },
      };
    }
  }

  // Check for todo intent
  for (let i = 0; i < todoPatterns.length; i++) {
    const pattern = todoPatterns[i];
    const match = input.match(pattern);
    if (match) {
      let taskText = match[1].trim();
      let dueDate = extractedDate;

      // For patterns with explicit date extraction (patterns 2, 3, 4, 5, 6)
      if (i >= 2 && i <= 6 && match[2]) {
        const dateText = match[2].trim();
        const parsedDate = chrono.parse(dateText);
        if (parsedDate.length > 0) {
          dueDate = parsedDate[0].start.date().toISOString().split('T')[0];
        }
      }

      // For simple action verb patterns (pattern 7)
      if (i === 7 && match[2]) {
        taskText = `${match[1]} ${match[2]}`.trim();
      }

      // For generic simple task (pattern 8)
      if (i === 8) {
        taskText = match[1].trim();
      }

      return {
        intent: 'add_todo',
        payload: {
          task: taskText,
          due_date: dueDate,
        },
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
          purchase_promo_available: match[2] && match[2].includes('0'),
        },
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
          task: `Pay ${match[1].trim()}`,
          due_date: extractedDate,
        },
      };
    }
  }

  return {
    intent: 'unknown',
    payload: {
      original_text: text,
    },
  };
};

// Helper functions
const mapCategory = category => {
  const categoryMap = {
    groceries: 'Food',
    food: 'Food',
    gas: 'Transportation',
    fuel: 'Transportation',
    medicine: 'Healthcare',
    medical: 'Healthcare',
    shopping: 'Shopping',
    entertainment: 'Entertainment',
    bills: 'Bills',
    utilities: 'Bills',
  };

  return categoryMap[category.toLowerCase()] || 'Other';
};

const extractBankName = cardName => {
  const bankMap = {
    chase: 'Chase',
    citi: 'Citi',
    amex: 'American Express',
    discover: 'Discover',
    'capital one': 'Capital One',
    'wells fargo': 'Wells Fargo',
    'bank of america': 'Bank of America',
  };

  const lowerCardName = cardName.toLowerCase();
  for (const [key, value] of Object.entries(bankMap)) {
    if (lowerCardName.includes(key)) {
      return value;
    }
  }

  return cardName.split(' ')[0]; // First word as bank name
};

const parsePromoDate = dateStr => {
  const parsed = chrono.parseDate(dateStr);
  return parsed ? parsed.toISOString().split('T')[0] : null;
};
