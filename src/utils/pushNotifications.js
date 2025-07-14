// Utility functions for sending push notifications (for testing)
export const sendTestNotification = async (token, title = 'Finance To-Dos', body = 'Test notification') => {
  // This would typically be called from your backend
  // For testing purposes, you can use Firebase Console or a testing tool
  console.log('Send notification to token:', token);
  console.log('Title:', title);
  console.log('Body:', body);
  
  // Example payload structure for your backend:
  const payload = {
    to: token,
    notification: {
      title: title,
      body: body,
      icon: '/icons/official-logo.png',
      badge: '/icons/official-logo.png',
      click_action: '/'
    },
    data: {
      type: 'finance-todos',
      timestamp: Date.now()
    }
  };
  
  return payload;
};

// Function to trigger notifications for specific events
export const triggerTaskReminder = (token, taskName, dueDate) => {
  return sendTestNotification(
    token,
    'Task Reminder',
    `Don't forget: ${taskName} is due ${dueDate}`
  );
};

export const triggerPaymentReminder = (token, cardName) => {
  return sendTestNotification(
    token,
    'Payment Reminder',
    `Time to pay your ${cardName} credit card`
  );
};

export const triggerBudgetAlert = (token, category, amount) => {
  return sendTestNotification(
    token,
    'Budget Alert',
    `You've spent $${amount} on ${category} this month`
  );
};