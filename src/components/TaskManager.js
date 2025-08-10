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

  if (loading) return <div className="p-4">Loading tasks...</div>;

  return (
    <div className="p-4 md:p-6 bg-white rounded-lg shadow-lg max-w-3xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2
          data-cy="todo-manager-heading"
          className="text-2xl font-bold text-blue-700 flex items-center"
        >
          <span className="mr-2">📝</span>
          To-Do Manager
        </h2>
        <div className="flex bg-gray-100 rounded-full p-1 w-full sm:w-auto shadow-inner">
          <button
            data-cy="view-cards-button"
            onClick={() => setViewMode('cards')}
            className={`px-4 py-2 rounded-full text-sm transition-all flex-1 sm:flex-auto ${
              viewMode === 'cards'
                ? 'bg-white shadow-md text-blue-600 font-medium'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📋 Cards
          </button>
          <button
            data-cy="view-table-button"
            onClick={() => setViewMode('table')}
            className={`px-4 py-2 rounded-full text-sm transition-all flex-1 sm:flex-auto ${
              viewMode === 'table'
                ? 'bg-white shadow-md text-blue-600 font-medium'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📊 Table
          </button>
        </div>
      </div>

      {message && (
        <div
          className={`p-3 rounded mb-4 ${message.includes('❌') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}
        >
          {message}
        </div>
      )}

      {/* Add Todo Form */}
      <form onSubmit={handleAddTodo} className="mb-8">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <label
              htmlFor="task-input"
              className="text-xs font-medium text-gray-700 mb-1 block text-left"
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
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm shadow-sm"
            />
          </div>
          <div className="flex flex-col w-full sm:w-auto">
            <label
              htmlFor="task-due-date"
              className="text-xs font-medium text-gray-700 mb-1 text-left block"
            >
              Due Date
            </label>
            <input
              id="task-due-date"
              data-cy="task-date-field"
              type="date"
              value={taskDate}
              onChange={e => setTaskDate(e.target.value)}
              className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 sm:w-40 text-sm"
              required
            />
          </div>
          <div className="flex flex-col w-full sm:w-auto justify-end mt-4 sm:mt-0">
            <button
              type="submit"
              data-cy={editingTodo ? 'task-update-button' : 'task-add-button'}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto text-sm font-medium shadow-md flex items-center justify-center"
            >
              <span className="mr-1">{editingTodo ? '✏️' : '➕'}</span>
              {editingTodo ? 'Update' : 'Add Task'}
            </button>
            {editingTodo && (
              <button
                type="button"
                onClick={() => {
                  setEditingTodo(null);
                  setNewTask('');
                  // Reset to today's date when canceling
                  setTaskDate(getTodayDateString());
                }}
                className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors w-full sm:w-auto text-sm mt-2 sm:mt-2 font-medium shadow-md"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2 flex items-center">
          <span className="mr-1">💡</span>
          <span>
            Use natural language or ask <strong>FinBot 🤖</strong> for voice input
          </span>
        </p>
      </form>

      {/* Tasks */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">
          Tasks ({pendingTodos.length} pending, {todos.filter(t => t.completed).length} completed)
        </h3>

        {pendingTodos.length === 0 ? (
          <p className="text-gray-600 text-center py-8">No pending tasks. Great job! 🎉</p>
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
                  <h4 className="text-md font-medium text-yellow-700 mb-3 flex items-center">
                    <span className="mr-2">📌</span>
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
          <div>
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-2 text-left text-xs font-medium">
                    Status
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left text-xs font-medium">
                    Task
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left text-xs font-medium">
                    Due Date
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left text-xs font-medium">
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
            className="flex items-center justify-between w-full p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors mb-4"
          >
            <h3 className="text-lg font-semibold text-gray-700">
              Completed Tasks ({todos.filter(t => t.completed).length})
            </h3>
            <svg
              className={`w-5 h-5 text-gray-500 transition-transform ${showCompleted ? 'rotate-180' : ''}`}
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
            <div className="space-y-1">
              {todos
                .filter(t => t.completed)
                .map(todo => (
                  <div
                    key={todo.id}
                    className="flex items-center justify-between p-2 bg-green-50 rounded-lg mb-1"
                  >
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={true}
                        onChange={() => handleToggleComplete(todo.id, todo.completed)}
                        className="w-4 h-4 text-green-600 rounded"
                      />
                      <div className="flex flex-wrap sm:flex-nowrap items-center">
                        <span className="line-through text-gray-600 text-sm">{todo.task}</span>
                        <span className="text-xs text-gray-500 ml-2 whitespace-nowrap">
                          Completed: {formatDateString(todo.updated_at)}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(todo.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded transition-colors"
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
