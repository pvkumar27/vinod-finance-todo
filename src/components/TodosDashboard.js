import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import DashboardCard from './DashboardCard';

const TodosDashboard = ({ onClose }) => {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTodos();
  }, []);

  const loadTodos = async () => {
    try {
      const data = await api.getTodos();
      setTodos(data || []);
    } catch (error) {
      console.error('Error loading todos:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    totalTodos: todos.length,
    completedTodos: todos.filter(todo => todo.completed).length,
    pendingTodos: todos.filter(todo => !todo.completed).length,
    completionRate:
      todos.length > 0
        ? ((todos.filter(todo => todo.completed).length / todos.length) * 100).toFixed(1)
        : 0,
  };

  const priorityTodos = todos.filter(todo => !todo.completed && todo.priority === 'high');
  const dueTodos = todos.filter(todo => {
    if (!todo.due_date || todo.completed) return false;
    const dueDate = new Date(todo.due_date);
    const today = new Date();
    return dueDate <= today;
  });

  const recentCompleted = todos
    .filter(todo => todo.completed)
    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
    .slice(0, 5);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">✅ To-Dos Dashboard</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">
              ×
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <DashboardCard title="Total Tasks" value={stats.totalTodos} icon="📋" color="primary" />
            <DashboardCard
              title="Completed"
              value={stats.completedTodos}
              icon="✅"
              color="success"
            />
            <DashboardCard title="Pending" value={stats.pendingTodos} icon="⏳" color="warning" />
            <DashboardCard
              title="Completion Rate"
              value={`${stats.completionRate}%`}
              icon="📊"
              color={
                stats.completionRate >= 80
                  ? 'success'
                  : stats.completionRate >= 50
                    ? 'warning'
                    : 'danger'
              }
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Priority & Overdue</h3>
              {priorityTodos.length === 0 && dueTodos.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">🎉</div>
                  <p>No urgent tasks!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {dueTodos.slice(0, 3).map(todo => (
                    <div
                      key={todo.id}
                      className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-red-900">{todo.title}</p>
                        <p className="text-sm text-red-600">Overdue</p>
                      </div>
                      <span className="text-2xl">🚨</span>
                    </div>
                  ))}
                  {priorityTodos.slice(0, 3).map(todo => (
                    <div
                      key={todo.id}
                      className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-orange-900">{todo.title}</p>
                        <p className="text-sm text-orange-600">High Priority</p>
                      </div>
                      <span className="text-2xl">⚡</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recently Completed</h3>
              {recentCompleted.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">📝</div>
                  <p>No completed tasks yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentCompleted.map(todo => (
                    <div
                      key={todo.id}
                      className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-green-900">{todo.title}</p>
                        <p className="text-sm text-green-600">
                          Completed {new Date(todo.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="text-2xl">✅</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Overall Progress</span>
              <span className="text-sm text-gray-500">
                {stats.completedTodos} of {stats.totalTodos} completed
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-green-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${stats.completionRate}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TodosDashboard;
