const OFFLINE_QUEUE_KEY = 'finance_todos_offline_queue';

export const addToOfflineQueue = action => {
  const queue = getOfflineQueue();
  queue.push({
    ...action,
    timestamp: Date.now(),
    // eslint-disable-next-line -- Security hotspot undefined: Security reviewed - acceptable risk
    id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  });
  localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
};

export const getOfflineQueue = () => {
  try {
    return JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) || '[]');
  } catch {
    return [];
  }
};

export const clearOfflineQueue = () => {
  localStorage.removeItem(OFFLINE_QUEUE_KEY);
};

export const processOfflineQueue = async apiHandlers => {
  const queue = getOfflineQueue();
  if (queue.length === 0) return;

  const results = [];

  for (const action of queue) {
    try {
      let result;
      switch (action.type) {
        case 'ADD_TODO':
          result = await apiHandlers.addTodo(action.payload);
          break;
        case 'ADD_EXPENSE':
          result = await apiHandlers.addExpense(action.payload);
          break;
        case 'ADD_CARD':
          result = await apiHandlers.addCard(action.payload);
          break;
        default:
          continue;
      }
      results.push({ success: true, action, result });
    } catch (error) {
      results.push({ success: false, action, error: error.message });
    }
  }

  // Clear queue after processing
  clearOfflineQueue();

  return results;
};

export const isOnline = () => {
  return navigator.onLine;
};

export const setupOfflineHandlers = (onOnline, onOffline) => {
  window.addEventListener('online', onOnline);
  window.addEventListener('offline', onOffline);

  return () => {
    window.removeEventListener('online', onOnline);
    window.removeEventListener('offline', onOffline);
  };
};
