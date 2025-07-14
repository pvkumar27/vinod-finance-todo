import { triggerTaskReminder } from './pushNotifications';

export const scheduleTaskReminders = (todos, fcmToken) => {
  if (!fcmToken) return;
  
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  
  todos.forEach(todo => {
    if (todo.completed || !todo.due_date) return;
    
    const dueDate = new Date(todo.due_date);
    const isOverdue = dueDate < today;
    const isDueToday = dueDate.toDateString() === today.toDateString();
    const isDueTomorrow = dueDate.toDateString() === tomorrow.toDateString();
    
    if (isOverdue) {
      // Immediate notification for overdue tasks
      setTimeout(() => {
        triggerTaskReminder(fcmToken, todo.task, 'OVERDUE');
      }, 1000);
    } else if (isDueToday) {
      // Morning reminder for today's tasks
      const reminderTime = new Date();
      reminderTime.setHours(9, 0, 0, 0);
      
      if (reminderTime > today) {
        setTimeout(() => {
          triggerTaskReminder(fcmToken, todo.task, 'today');
        }, reminderTime - today);
      }
    } else if (isDueTomorrow) {
      // Evening reminder for tomorrow's tasks
      const reminderTime = new Date();
      reminderTime.setHours(18, 0, 0, 0);
      
      if (reminderTime > today) {
        setTimeout(() => {
          triggerTaskReminder(fcmToken, todo.task, 'tomorrow');
        }, reminderTime - today);
      }
    }
  });
};