import React from 'react';
import TaskItem from './TaskItem';
import AppleWalletCard from './ui/AppleWalletCard';

const TaskList = ({ tasks, onToggleComplete, onTogglePin, onEdit, onDelete, onStartPomodoro }) => {
  // If no tasks, show empty state
  if (tasks.length === 0) {
    return (
      <AppleWalletCard className="text-center py-12 aw-fade-in">
        <div className="text-6xl mb-4 aw-scale-in">🎉</div>
        <h3 className="aw-heading-md mb-2">All Done!</h3>
        <p className="aw-text-caption">No tasks here. Great job!</p>
      </AppleWalletCard>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task, index) => (
        <div
          key={task.id}
          data-id={task.id}
          className="task-item aw-slide-in"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <TaskItem
            task={task}
            onToggleComplete={onToggleComplete}
            onTogglePin={onTogglePin}
            onEdit={onEdit}
            onDelete={onDelete}
            onStartPomodoro={onStartPomodoro}
          />
        </div>
      ))}
    </div>
  );
};

export default TaskList;
