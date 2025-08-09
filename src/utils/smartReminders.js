import { triggerTaskReminder } from './pushNotifications';

/**
 * Sanitizes user input to prevent XSS and injection attacks
 * @param {string} input - The input to sanitize
 * @returns {string} - Sanitized input
 */
const sanitizeInput = input => {
  if (typeof input !== 'string') return '';
  return input
    .replace(/[<>"'&]/g, '') // Remove potentially dangerous characters
    .trim()
    .substring(0, 500); // Limit length
};

/**
 * Validates todo object structure
 * @param {Object} todo - Todo object to validate
 * @returns {boolean} - Whether todo is valid
 */
const isValidTodo = todo => {
  return (
    todo &&
    typeof todo === 'object' &&
    typeof todo.task === 'string' &&
    todo.task.length > 0 &&
    (todo.due_date === null || typeof todo.due_date === 'string')
  );
};

export const scheduleTaskReminders = (todos, fcmToken) => {
  // Input validation
  if (!fcmToken || typeof fcmToken !== 'string') return;
  if (!Array.isArray(todos)) return;

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  todos.forEach(todo => {
    // Validate todo structure
    if (!isValidTodo(todo) || todo.completed || !todo.due_date) return;

    // Sanitize task content
    const sanitizedTask = sanitizeInput(todo.task);
    if (!sanitizedTask) return;

    const dueDate = new Date(todo.due_date);
    // Validate date
    if (isNaN(dueDate.getTime())) return;

    const isOverdue = dueDate < today;
    const isDueToday = dueDate.toDateString() === today.toDateString();
    const isDueTomorrow = dueDate.toDateString() === tomorrow.toDateString();

    if (isOverdue) {
      // Immediate notification for overdue tasks
      setTimeout(() => {
        triggerTaskReminder(fcmToken, sanitizedTask, 'OVERDUE');
      }, 1000);
    } else if (isDueToday) {
      // Morning reminder for today's tasks
      const reminderTime = new Date();
      reminderTime.setHours(9, 0, 0, 0);

      if (reminderTime > today) {
        setTimeout(() => {
          triggerTaskReminder(fcmToken, sanitizedTask, 'today');
        }, reminderTime - today);
      }
    } else if (isDueTomorrow) {
      // Evening reminder for tomorrow's tasks
      const reminderTime = new Date();
      reminderTime.setHours(18, 0, 0, 0);

      if (reminderTime > today) {
        setTimeout(() => {
          triggerTaskReminder(fcmToken, sanitizedTask, 'tomorrow');
        }, reminderTime - today);
      }
    }
  });
};
