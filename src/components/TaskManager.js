import React, { useState, useEffect } from 'react';
import { getTodayDateString, formatDateString } from '../utils/dateUtils';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { arrayMove } from '@dnd-kit/sortable';
import { api } from '../services/api';
import { parseInput } from '../utils/parseInput';
import TaskList from './TaskList';

const TaskManager = () => {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [newTask, setNewTask] = useState('');
  // Default due date is today
  const [taskDate, setTaskDate] = useState(getTodayDateString());
  const [editingTodo, setEditingTodo] = useState(null);

  const [showCompleted, setShowCompleted] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const [viewMode, setViewMode] = useState('cards');

  // Configure sensors with no constraints for better mobile support
  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor));

  const loadTodos = async () => {
    try {
      const data = await api.getTodos();
      setTodos(data || []);
    } catch (error) {
      console.error('Error loading todos:', error);
      setMessage(`❌ Error loading tasks: ${error.message}`);
      setTimeout(() => setMessage(''), 4000);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = todo => {
    setEditingTodo(todo);
    setNewTask(todo.task);

    // Use the date string directly
    if (todo.due_date) {
      // Extract just the date part (YYYY-MM-DD)
      setTaskDate(todo.due_date.split('T')[0]);
    } else {
      setTaskDate(getTodayDateString());
    }

    // Scroll to the top and focus the input after a short delay
    setTimeout(() => {
      window.scrollTo(0, 0);

      const inputField = document.getElementById('task-input');
      if (inputField) {
        inputField.focus();
        if ('ontouchstart' in window) {
          inputField.click();
        }
      }
    }, 300);
  };

  const handleAddTodo = async e => {
    e.preventDefault();
    if (!newTask.trim()) return;

    try {
      if (editingTodo) {
        // When updating a task, use the date string directly
        await api.updateTodo(editingTodo.id, {
          task: newTask.trim(),
          due_date: taskDate, // YYYY-MM-DD format
        });
        setMessage('✅ Task updated successfully!');
        setTimeout(() => setMessage(''), 4000);
        setEditingTodo(null);
      } else {
        const parsed = parseInput(newTask);
        let todoData;

        if (parsed.intent === 'add_todo' || parsed.intent === 'reminder') {
          todoData =
            parsed.intent === 'add_todo'
              ? parsed.payload
              : {
                  task: parsed.payload.task,
                  due_date: parsed.payload.due_date,
                  notes: `Reminder for ${parsed.payload.card_name}`,
                };
        } else {
          todoData = {
            task: newTask.trim(),
            due_date: taskDate, // YYYY-MM-DD format
            pinned: false,
          };
        }

        await api.addTodo(todoData);
        setMessage('✅ Task added successfully!');
        setTimeout(() => setMessage(''), 4000);
      }

      setNewTask('');
      // Reset to today's date after adding/updating a task
      setTaskDate(getTodayDateString());
      loadTodos();
    } catch (err) {
      setMessage(`❌ Error: ${err.message}`);
      setTimeout(() => setMessage(''), 4000);
    }
  };

  const handleToggleComplete = async (id, completed) => {
    try {
      await api.updateTodo(id, { completed: !completed });
      setMessage('✅ Task updated!');
      setTimeout(() => setMessage(''), 4000);
      loadTodos();
    } catch (err) {
      setMessage(`❌ Error: ${err.message}`);
      setTimeout(() => setMessage(''), 4000);
    }
  };

  const handleTogglePin = async (id, pinned) => {
    try {
      await api.updateTodo(id, { pinned: !pinned });
      setMessage(pinned ? '📌 Task unpinned!' : '📌 Task pinned!');
      setTimeout(() => setMessage(''), 4000);
      loadTodos();
    } catch (err) {
      setMessage(`❌ Error: ${err.message}`);
      setTimeout(() => setMessage(''), 4000);
    }
  };

  const handleDelete = async id => {
    try {
      await api.deleteTodo(id);
      setMessage('✅ Task deleted!');
      setTimeout(() => setMessage(''), 4000);
      loadTodos();
    } catch (err) {
      setMessage(`❌ Error: ${err.message}`);
      setTimeout(() => setMessage(''), 4000);
    }
  };

  const handleDragStart = event => {
    setActiveId(event.active.id);
    document.body.classList.add('dragging-active');
  };

  const handleDragEnd = async event => {
    setActiveId(null);
    document.body.classList.remove('dragging-active');

    const { active, over } = event;

    if (!over || active.id === over.id) return;

    try {
      // Find the active and over tasks
      const activeTask = todos.find(t => t.id === active.id);
      const overTask = todos.find(t => t.id === over.id);

      if (!activeTask || !overTask) return;

      // Don't allow dragging between pinned and unpinned sections
      if (activeTask.pinned !== overTask.pinned) {
        return;
      }

      // Get the list we're working with (pinned or unpinned)
      const taskList = activeTask.pinned
        ? todos.filter(t => t.pinned && !t.completed)
        : todos.filter(t => !t.pinned && !t.completed);

      // Find the indices
      const oldIndex = taskList.findIndex(t => t.id === active.id);
      const newIndex = taskList.findIndex(t => t.id === over.id);

      // Reorder the list
      const reorderedList = arrayMove(taskList, oldIndex, newIndex);

      // Update the local state immediately for a responsive UI
      const updatedTodos = [...todos];

      // First, remove all the tasks that were reordered
      reorderedList.forEach(task => {
        const index = updatedTodos.findIndex(t => t.id === task.id);
        if (index !== -1) {
          updatedTodos.splice(index, 1);
        }
      });

      // Then add them back in the correct order
      // Find where to insert them
      let insertIndex = 0;
      if (activeTask.pinned) {
        // Insert at the beginning for pinned tasks
        insertIndex = 0;
      } else {
        // Insert after all pinned tasks for unpinned tasks
        insertIndex = updatedTodos.filter(t => t.pinned && !t.completed).length;
      }

      // Insert the reordered tasks
      updatedTodos.splice(insertIndex, 0, ...reorderedList);

      // Update the state
      setTodos(updatedTodos);

      // Update the order in the database
      await api.updateTodoOrder(reorderedList);
    } catch (err) {
      console.error('Error updating order:', err);
      setMessage(`❌ Error updating order: ${err?.message || 'Unknown error'}`);
      setTimeout(() => setMessage(''), 4000);
      loadTodos();
    }
  };

  const handleDragCancel = () => {
    setActiveId(null);
    document.body.classList.remove('dragging-active');
  };

  useEffect(() => {
    loadTodos();

    // Listen for todos added by AI Assistant
    const handleTodoAdded = () => {
      loadTodos();
    };

    // Listen for AI-triggered view switches
    const handleViewSwitch = event => {
      const { viewMode } = event.detail;
      setViewMode(viewMode);
    };

    window.addEventListener('todoAdded', handleTodoAdded);
    window.addEventListener('switchView', handleViewSwitch);

    // Add global styles for drag and drop
    const style = document.createElement('style');
    style.textContent = `
      .dragging-active * {
        cursor: grabbing !important;
        touch-action: none !important;
      }
      
      [data-testid="task-item"] {
        touch-action: none;
      }
    `;
    document.head.appendChild(style);

    return () => {
      window.removeEventListener('todoAdded', handleTodoAdded);
      window.removeEventListener('switchView', handleViewSwitch);
      document.head.removeChild(style);
    };
  }, []);

  // Separate pinned and unpinned todos with chronological sorting
  const pendingTodos = React.useMemo(() => {
    return todos
      .filter(t => !t.completed)
      .sort((a, b) => new Date(a.due_date || '9999-12-31') - new Date(b.due_date || '9999-12-31'));
  }, [todos]);

  const pinnedTodos = React.useMemo(() => {
    return pendingTodos.filter(t => t.pinned);
  }, [pendingTodos]);

  const unpinnedTodos = React.useMemo(() => {
    return pendingTodos.filter(t => !t.pinned);
  }, [pendingTodos]);

  // Find the active task for the drag overlay
  const activeTask = activeId ? todos.find(task => task.id === activeId) : null;

  if (loading) return <div className="p-4 text-gray-300">Loading tasks...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2
          data-cy="todo-manager-heading"
          className="text-3xl font-bold text-white flex items-center"
        >
          <span className="mr-3 text-4xl">📝</span>
          To-Do Manager
        </h2>
        <div className="cleo-card p-1 flex w-full sm:w-auto">
          <button
            data-cy="view-cards-button"
            onClick={() => setViewMode('cards')}
            className={`cleo-tab px-6 py-3 text-sm font-medium flex-1 sm:flex-auto ${
              viewMode === 'cards' ? 'active' : ''
            }`}
          >
            📋 Cards
          </button>
          <button
            data-cy="view-table-button"
            onClick={() => setViewMode('table')}
            className={`cleo-tab px-6 py-3 text-sm font-medium flex-1 sm:flex-auto ${
              viewMode === 'table' ? 'active' : ''
            }`}
          >
            📊 Table
          </button>
        </div>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl mb-6 border ${
            message.includes('❌')
              ? 'bg-red-500/20 border-red-500/50 text-red-400'
              : 'bg-green-500/20 border-green-500/50 text-green-400'
          }`}
        >
          {message}
        </div>
      )}

      {/* Add Todo Form */}
      <div className="cleo-card p-6 mb-8">
        <form onSubmit={handleAddTodo}>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <label
                htmlFor="task-input"
                className="text-sm font-medium text-gray-300 mb-2 block text-left"
              >
                Task
              </label>
              <input
                id="task-input"
                data-cy="task-input-field"
                type="text"
                placeholder={editingTodo ? 'Edit task...' : 'Add a new task...'}
                value={newTask}
                onChange={e => setNewTask(e.target.value)}
                className="cleo-input w-full"
              />
            </div>
            <div className="flex flex-col w-full sm:w-auto">
              <label
                htmlFor="task-due-date"
                className="text-sm font-medium text-gray-300 mb-2 text-left block"
              >
                Due Date
              </label>
              <input
                id="task-due-date"
                data-cy="task-date-field"
                type="date"
                value={taskDate}
                onChange={e => setTaskDate(e.target.value)}
                className="cleo-input sm:w-40"
                required
              />
            </div>
            <div className="flex flex-col w-full sm:w-auto justify-end mt-4 sm:mt-0">
              <button
                type="submit"
                data-cy={editingTodo ? 'task-update-button' : 'task-add-button'}
                className="cleo-button-primary w-full sm:w-auto flex items-center justify-center"
              >
                <span className="mr-2">{editingTodo ? '✏️' : '➕'}</span>
                {editingTodo ? 'Update' : 'Add Task'}
              </button>
              {editingTodo && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingTodo(null);
                    setNewTask('');
                    setTaskDate(getTodayDateString());
                  }}
                  className="cleo-button-secondary w-full sm:w-auto mt-3"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-4 flex items-center">
            <span className="mr-2">💡</span>
            <span>
              Use natural language or ask <strong className="text-purple-400">FinBot 🤖</strong> for
              voice input
            </span>
          </p>
        </form>
      </div>

      {/* Tasks */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-white mb-6">
          Tasks ({pendingTodos.length} pending, {todos.filter(t => t.completed).length} completed)
        </h3>

        {pendingTodos.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4 cleo-animate-float">🎉</div>
            <p className="text-xl text-gray-300">No pending tasks. Great job!</p>
          </div>
        ) : viewMode === 'cards' ? (
          <div data-cy="task-container" className="task-container">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDragCancel={handleDragCancel}
              modifiers={[restrictToVerticalAxis]}
            >
              {/* Pinned Tasks Section */}
              {pinnedTodos.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-yellow-400 mb-4 flex items-center">
                    <span className="mr-3">📌</span>
                    Pinned Tasks
                  </h4>
                  <TaskList
                    tasks={pinnedTodos}
                    onToggleComplete={handleToggleComplete}
                    onTogglePin={handleTogglePin}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                </div>
              )}

              {/* Unpinned Tasks Section - No heading */}
              {unpinnedTodos.length > 0 && (
                <div className={pinnedTodos.length > 0 ? 'mt-8' : ''}>
                  <TaskList
                    tasks={unpinnedTodos}
                    onToggleComplete={handleToggleComplete}
                    onTogglePin={handleTogglePin}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                </div>
              )}

              {/* Drag Overlay */}
              <DragOverlay>
                {activeTask ? (
                  <div
                    className={`${activeTask.pinned ? 'bg-yellow-50 shadow-xl rounded-lg border-2 border-yellow-300' : 'bg-blue-50 shadow-xl rounded-lg border-2 border-blue-300'} p-3 w-full max-w-md opacity-95`}
                  >
                    <div className="flex items-center">
                      <div className="mr-3">
                        <input
                          type="checkbox"
                          checked={activeTask.completed || false}
                          readOnly
                          className="w-4 h-4 rounded-full border-2 border-gray-300 text-blue-500"
                        />
                      </div>
                      <div className="flex-1 flex items-center">
                        <span className="text-sm text-gray-900 font-medium">{activeTask.task}</span>
                        {activeTask.due_date && (
                          <span className="text-xs text-gray-500 ml-2">
                            Due: {formatDateString(activeTask.due_date)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          </div>
        ) : (
          <div className="cleo-card overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-white/5">
                  <th className="border-b border-white/10 px-4 py-3 text-left text-sm font-semibold text-gray-300">
                    Status
                  </th>
                  <th className="border-b border-white/10 px-4 py-3 text-left text-sm font-semibold text-gray-300">
                    Task
                  </th>
                  <th className="border-b border-white/10 px-4 py-3 text-left text-sm font-semibold text-gray-300">
                    Due Date
                  </th>
                  <th className="border-b border-white/10 px-4 py-3 text-left text-sm font-semibold text-gray-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {/* Pinned todos */}
                {pinnedTodos.length > 0 && (
                  <tr className="bg-yellow-100">
                    <td
                      colSpan="4"
                      className="border border-gray-300 px-4 py-2 font-medium text-xs"
                    >
                      📌 Pinned Tasks
                    </td>
                  </tr>
                )}

                {pinnedTodos.map(todo => (
                  <tr key={todo.id} className="bg-yellow-50">
                    <td className="border border-gray-300 px-4 py-2 text-left">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={false}
                          onChange={() => handleToggleComplete(todo.id, todo.completed)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <span title="Pinned task">📌</span>
                      </div>
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-left font-medium text-sm">
                      {todo.task}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-left text-xs">
                      {todo.due_date ? formatDateString(todo.due_date) : '-'}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-left">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleTogglePin(todo.id, todo.pinned)}
                          className="text-yellow-600 hover:text-yellow-800"
                          title="Unpin task"
                        >
                          📌
                        </button>
                        <button
                          onClick={() => handleEdit(todo)}
                          className="text-blue-500 hover:text-blue-700"
                          title="Edit task"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(todo.id)}
                          className="text-red-500 hover:text-red-700"
                          title="Delete task"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {/* Separator row if there are both pinned and unpinned todos */}
                {pinnedTodos.length > 0 && unpinnedTodos.length > 0 && (
                  <tr className="bg-gray-100">
                    <td colSpan="4" className="border border-gray-300 py-1"></td>
                  </tr>
                )}

                {/* Unpinned todos */}
                {unpinnedTodos.map(todo => (
                  <tr key={todo.id} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2 text-left">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={false}
                          onChange={() => handleToggleComplete(todo.id, todo.completed)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                      </div>
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-left font-medium text-sm">
                      {todo.task}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-left text-xs">
                      {todo.due_date ? formatDateString(todo.due_date) : '-'}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-left">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleTogglePin(todo.id, todo.pinned)}
                          className="text-gray-400 hover:text-yellow-600"
                          title="Pin task"
                        >
                          📌
                        </button>
                        <button
                          onClick={() => handleEdit(todo)}
                          className="text-blue-500 hover:text-blue-700"
                          title="Edit task"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(todo.id)}
                          className="text-red-500 hover:text-red-700"
                          title="Delete task"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Completed Tasks - Collapsible */}
      {todos.filter(t => t.completed).length > 0 && (
        <div>
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className="cleo-card flex items-center justify-between w-full p-4 hover:transform hover:scale-[1.02] transition-all duration-300 mb-6"
          >
            <h3 className="text-xl font-bold text-white">
              Completed Tasks ({todos.filter(t => t.completed).length})
            </h3>
            <svg
              className={`w-6 h-6 text-gray-300 transition-transform ${showCompleted ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {showCompleted && (
            <div className="space-y-2">
              {todos
                .filter(t => t.completed)
                .map(todo => (
                  <div
                    key={todo.id}
                    className="cleo-card flex items-center justify-between p-4 bg-green-500/10 border-green-500/30"
                  >
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={true}
                        onChange={() => handleToggleComplete(todo.id, todo.completed)}
                        className="w-4 h-4 text-green-500 rounded"
                      />
                      <div className="flex flex-wrap sm:flex-nowrap items-center">
                        <span className="line-through text-gray-300 text-sm">{todo.task}</span>
                        <span className="text-xs text-gray-400 ml-2 whitespace-nowrap">
                          Completed: {formatDateString(todo.updated_at)}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(todo.id)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/20 p-2 rounded-lg transition-all duration-200"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskManager;
