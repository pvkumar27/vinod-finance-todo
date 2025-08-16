import NotificationScheduler from './notificationScheduler';

/**
 * Helper to sync todos with notification scheduler
 */
export const syncTodosWithNotifications = todos => {
  try {
    // Update the todos cache for notifications
    NotificationScheduler.updateTodosCache(todos);
  } catch (error) {
    console.error('Failed to sync todos with notifications:', error);
  }
};

/**
 * Mark task as completed and update notification cache
 */
export const markTaskCompleted = (taskId, todos) => {
  try {
    const updatedTodos = todos.map(todo =>
      todo.id === taskId
        ? { ...todo, completed: true, completed_at: new Date().toISOString() }
        : todo
    );

    NotificationScheduler.updateTodosCache(updatedTodos);
    return updatedTodos;
  } catch (error) {
    console.error('Failed to mark task as completed:', error);
    return todos;
  }
};

/**
 * Add new task and update notification cache
 */
export const addTaskWithNotification = (newTask, todos) => {
  try {
    const updatedTodos = [...todos, newTask];
    NotificationScheduler.updateTodosCache(updatedTodos);
    return updatedTodos;
  } catch (error) {
    console.error('Failed to add task with notification:', error);
    return [...todos, newTask];
  }
};
