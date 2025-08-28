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
import TaskPomodoroIntegration from './pomodoro/TaskPomodoroIntegration';
import TodoProgressBar from './TodoProgressBar';
import AppleWalletCard from './ui/AppleWalletCard';
import AppleWalletButton from './ui/AppleWalletButton';
import useSoundEffects from '../hooks/useSoundEffects';

const TaskManager = () => {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [newTask, setNewTask] = useState('');
  // Default due date is today
  const [taskDate, setTaskDate] = useState(getTodayDateString());
  const [editingTodo, setEditingTodo] = useState(null);

  const { taskComplete, buttonPress, success, error: errorSound } = useSoundEffects();

  const [showCompleted, setShowCompleted] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const [selectedPomodoroTask, setSelectedPomodoroTask] = useState(null);

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

      if (!completed) {
        // Task completed - play celebration sound and show animation
        taskComplete();
        showTaskCompleteAnimation();
        setMessage('🎉 Task completed! Great job!');
      } else {
        success();
        setMessage('✅ Task updated!');
      }

      setTimeout(() => setMessage(''), 4000);
      loadTodos();
    } catch (err) {
      setMessage(`❌ Error: ${err.message}`);
      setTimeout(() => setMessage(''), 4000);
    }
  };

  const playTaskCompleteSound = () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();

      // Success sound - ascending notes
      const notes = [261, 329, 392, 523]; // C4, E4, G4, C5

      notes.forEach((freq, index) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
        oscillator.type = 'sine';

        const startTime = audioContext.currentTime + index * 0.1;
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);

        oscillator.start(startTime);
        oscillator.stop(startTime + 0.3);
      });
    } catch (error) {
      console.log('Audio not supported:', error);
    }
  };

  const showTaskCompleteAnimation = () => {
    // Create confetti animation
    const colors = ['🎉', '✨', '🎆', '🎈'];

    for (let i = 0; i < 8; i++) {
      setTimeout(() => {
        const confetti = document.createElement('div');
        confetti.innerHTML = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.cssText = `
          position: fixed;
          top: 20%;
          left: ${Math.random() * 100}%;
          font-size: 24px;
          pointer-events: none;
          z-index: 9999;
          animation: confetti-fall 2s ease-out forwards;
        `;

        document.body.appendChild(confetti);

        setTimeout(() => {
          if (confetti.parentNode) {
            confetti.parentNode.removeChild(confetti);
          }
        }, 2000);
      }, i * 100);
    }

    // Add CSS animation if not exists
    if (!document.getElementById('confetti-style')) {
      const style = document.createElement('style');
      style.id = 'confetti-style';
      style.textContent = `
        @keyframes confetti-fall {
          0% {
            transform: translateY(-100px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
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

  const handleStartPomodoro = task => {
    // Request notification permission
    if (window.Notification && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          setMessage('🔔 Notifications enabled for Pomodoro alerts!');
          setTimeout(() => setMessage(''), 3000);
        }
      });
    }
    setSelectedPomodoroTask(task);
  };

  const handlePomodoroTaskComplete = async taskId => {
    try {
      // Use handleToggleComplete to trigger celebration animation
      const task = todos.find(t => t.id === taskId);
      if (task) {
        await handleToggleComplete(taskId, task.completed);
      }
      setSelectedPomodoroTask(null);
    } catch (err) {
      setMessage(`❌ Error: ${err.message}`);
      setTimeout(() => setMessage(''), 4000);
    }
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setMessage('❌ Voice recognition not supported in this browser');
      setTimeout(() => setMessage(''), 4000);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setMessage('🎤 Listening... Speak your task');
    };

    recognition.onresult = event => {
      const transcript = event.results[0][0].transcript;
      setNewTask(transcript);
      setMessage('✅ Voice input captured!');
      setTimeout(() => setMessage(''), 2000);
    };

    recognition.onerror = event => {
      let errorContent;
      if (event.error === 'not-allowed') {
        errorContent = '🎤 Microphone access denied. Please allow microphone access.';
      } else {
        errorContent = `❌ Voice recognition error: ${event.error}`;
      }
      setMessage(errorContent);
      setTimeout(() => setMessage(''), 4000);
    };

    recognition.start();
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

    window.addEventListener('todoAdded', handleTodoAdded);

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
    <div className="p-6" style={{ background: 'var(--aw-background)', minHeight: '100vh' }}>
      <AppleWalletCard className="mb-6 aw-fade-in">
        <h2 data-cy="todo-manager-heading" className="aw-heading-xl flex items-center">
          <span className="mr-3 text-2xl">📝</span>
          To-Do Manager
        </h2>
        <p className="aw-text-body mt-2">Organize your tasks with AI-powered productivity</p>
      </AppleWalletCard>

      {message && (
        <AppleWalletCard
          className={`mb-6 aw-fade-in ${
            message.includes('❌') ? 'aw-badge-error' : 'aw-badge-success'
          }`}
        >
          <div className="aw-text-body font-medium">{message}</div>
        </AppleWalletCard>
      )}

      {/* Add Todo Form */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6 hover:shadow-xl transition-all duration-200">
        <form onSubmit={handleAddTodo}>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <label
                htmlFor="task-input"
                className="text-sm font-medium mb-2 block text-left text-gray-700"
              >
                Task
              </label>
              <div className="relative">
                <input
                  id="task-input"
                  data-cy="task-input-field"
                  type="text"
                  placeholder={editingTodo ? 'Edit task...' : 'What needs to be done?'}
                  value={newTask}
                  onChange={e => setNewTask(e.target.value)}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                />
                <button
                  type="button"
                  onClick={() => {
                    buttonPress();
                    handleVoiceInput();
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-gray-100 active:scale-95"
                  title="Voice input"
                  aria-label="Voice input"
                >
                  <span className="text-lg">🎤</span>
                </button>
              </div>
            </div>
            <div className="flex flex-col w-full sm:w-auto">
              <label
                htmlFor="task-due-date"
                className="text-sm font-medium mb-2 text-left block text-gray-700"
              >
                Due Date
              </label>
              <input
                id="task-due-date"
                data-cy="task-date-field"
                type="date"
                value={taskDate}
                onChange={e => setTaskDate(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white sm:w-40"
                required
              />
            </div>
            <div className="flex flex-col w-full sm:w-auto justify-end mt-3 sm:mt-0">
              <button
                type="submit"
                data-cy={editingTodo ? 'task-update-button' : 'task-add-button'}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 w-full sm:w-auto"
                onClick={() => buttonPress()}
              >
                <span>{editingTodo ? '✏️' : '📝'}</span>
                {editingTodo ? 'Update' : 'Add Task'}
              </button>
              {editingTodo && (
                <button
                  type="button"
                  onClick={() => {
                    buttonPress();
                    setEditingTodo(null);
                    setNewTask('');
                    setTaskDate(getTodayDateString());
                  }}
                  className="bg-white text-gray-800 font-semibold px-6 py-3 rounded-xl border border-gray-300 shadow-md hover:bg-gray-50 hover:shadow-lg transition-all duration-200 active:scale-95 w-full sm:w-auto mt-3"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
          <p className="text-xs mt-4 flex items-center text-gray-500">
            <span className="mr-2">💡</span>
            <span>
              Use natural language or ask <strong className="text-blue-600">FinBot 🤖</strong> for
              voice input
            </span>
          </p>
        </form>
      </div>

      {/* Progress Bar */}
      <TodoProgressBar todos={todos} />

      {/* Tasks */}
      <div className="mb-8">
        <div className="mb-6">
          <h3 className="aw-heading-lg mb-2">
            <span className="hidden sm:inline">
              Tasks ({pendingTodos.length} pending, {todos.filter(t => t.completed).length}{' '}
              completed)
            </span>
            <span className="sm:hidden">
              Tasks {pendingTodos.length} pending • {todos.filter(t => t.completed).length} done
            </span>
          </h3>
        </div>

        {pendingTodos.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4 finbot-animate-float">🎉</div>
            <p className="text-xl text-gray-600">No pending tasks. Great job!</p>
          </div>
        ) : (
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
                <AppleWalletCard className="mb-6 aw-slide-in" elevated>
                  <h4 className="aw-heading-md mb-4 flex items-center">
                    <span className="mr-3">📌</span>
                    Pinned Tasks
                  </h4>
                  <TaskList
                    tasks={pinnedTodos}
                    onToggleComplete={handleToggleComplete}
                    onTogglePin={handleTogglePin}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onStartPomodoro={handleStartPomodoro}
                  />
                </AppleWalletCard>
              )}

              {/* Unpinned Tasks Section */}
              {unpinnedTodos.length > 0 && (
                <div className={pinnedTodos.length > 0 ? 'mt-6' : ''}>
                  <TaskList
                    tasks={unpinnedTodos}
                    onToggleComplete={handleToggleComplete}
                    onTogglePin={handleTogglePin}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onStartPomodoro={handleStartPomodoro}
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
        )}
      </div>

      {/* Completed Tasks - Collapsible */}
      {todos.filter(t => t.completed).length > 0 && (
        <AppleWalletCard className="aw-fade-in">
          <AppleWalletButton
            variant="ghost"
            onClick={() => setShowCompleted(!showCompleted)}
            className="w-full justify-between p-0 min-h-0 h-auto"
          >
            <h3 className="aw-heading-md">
              ✅ Completed ({todos.filter(t => t.completed).length})
            </h3>
            <svg
              className={`w-6 h-6 transition-transform ${showCompleted ? 'rotate-180' : ''}`}
              style={{ color: 'var(--aw-text-tertiary)' }}
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
          </AppleWalletButton>

          {showCompleted && (
            <div className="mt-4 space-y-2">
              {todos
                .filter(t => t.completed)
                .map((todo, index) => (
                  <div
                    key={todo.id}
                    className="aw-slide-in flex items-center justify-between p-3 rounded-lg"
                    style={{
                      background: 'var(--aw-surface-secondary)',
                      animationDelay: `${index * 50}ms`,
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={true}
                        onChange={() => handleToggleComplete(todo.id, todo.completed)}
                        className="w-4 h-4 rounded"
                        style={{ accentColor: 'var(--aw-secondary)' }}
                      />
                      <div>
                        <div className="aw-text-body line-through opacity-70">{todo.task}</div>
                        <div className="aw-text-caption">
                          Completed: {formatDateString(todo.updated_at)}
                        </div>
                      </div>
                    </div>
                    <AppleWalletButton
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(todo.id)}
                      className="w-8 h-8 p-0 min-h-0 text-red-500"
                    >
                      🗑️
                    </AppleWalletButton>
                  </div>
                ))}
            </div>
          )}
        </AppleWalletCard>
      )}

      {/* Pomodoro Modal */}
      {selectedPomodoroTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="w-full max-w-sm sm:max-w-md max-h-[90vh] overflow-y-auto">
            <TaskPomodoroIntegration
              task={selectedPomodoroTask}
              onTaskComplete={handlePomodoroTaskComplete}
              onClose={() => setSelectedPomodoroTask(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskManager;
