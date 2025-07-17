import React from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import TaskItem from './TaskItem';

const TaskList = ({ tasks, onToggleComplete, onTogglePin, onEdit, onDelete }) => {
  // If no tasks, show empty state
  if (tasks.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-2">🎉</div>
        <p className="text-gray-500 text-sm">No tasks here. Great job!</p>
      </div>
    );
  }

  return (
    <SortableContext 
      items={tasks.map(task => task.id)} 
      strategy={verticalListSortingStrategy}
    >
      <div className="space-y-0">
        {tasks.map((task) => (
          <div key={task.id} data-id={task.id} className="task-item">
            <TaskItem
              task={task}
              onToggleComplete={onToggleComplete}
              onTogglePin={onTogglePin}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          </div>
        ))}
      </div>
    </SortableContext>
  );
};

export default TaskList;