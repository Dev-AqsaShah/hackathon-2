'use client';

/**
 * Enhanced Dashboard Component
 *
 * Features:
 * - Manual task creation button
 * - AI-powered task creation via chat
 * - Task list view with animations
 * - Smooth transitions between views
 */

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { RobotAvatar } from '@/components/ui/RobotAvatar';
import { AnimatedChatInput } from '@/components/chat/AnimatedChatInput';
import { AnimatedMessage } from '@/components/chat/AnimatedMessage';
import { TypingIndicator } from '@/components/chat/TypingIndicator';
import {
  sendChatMessageAction,
  getChatHistoryAction,
  getTasksAction,
  createTaskAction,
  updateTaskAction,
  deleteTaskAction,
  type ChatMessage,
  type Task as ActionTask,
} from '@/lib/actions/chat-actions';

interface Task {
  id: number;
  title: string;
  description?: string | null;
  completed: boolean;
  created_at: string;
  updated_at?: string;
  owner_id?: number;
}

interface EnhancedDashboardProps {
  userId: string;
  userEmail?: string;
  userName: string;
  initialTasks: Task[];
}

type ViewMode = 'dashboard' | 'chat' | 'tasks' | 'add-task';

export function EnhancedDashboard({
  userId,
  userEmail,
  userName,
  initialTasks,
}: EnhancedDashboardProps) {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Manual task form state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [taskError, setTaskError] = useState<string | null>(null);

  // Stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Load chat history when opening chat
  useEffect(() => {
    if (viewMode === 'chat' && messages.length === 0) {
      loadChatHistory();
    }
  }, [viewMode]);

  const loadChatHistory = async () => {
    setIsChatLoading(true);
    try {
      const response = await getChatHistoryAction(userId, 50, userEmail);
      if (response.success && response.data) {
        setMessages(response.data.messages);
        if (response.data.conversation_id) {
          setConversationId(response.data.conversation_id);
        }
      }
    } catch (err) {
      console.error('Failed to load chat history:', err);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Refresh tasks after AI interaction
  const refreshTasks = useCallback(async () => {
    try {
      const response = await getTasksAction(userId, userEmail);
      if (response.success && response.data) {
        setTasks(response.data.sort((a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        ));
      }
    } catch (err) {
      console.error('Failed to refresh tasks:', err);
    }
  }, [userId, userEmail]);

  // Create task manually
  const handleCreateTask = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || isCreatingTask) return;

    setIsCreatingTask(true);
    setTaskError(null);

    try {
      const response = await createTaskAction(
        userId,
        {
          title: newTaskTitle.trim(),
          description: newTaskDescription.trim() || undefined,
        },
        userEmail
      );

      if (response.success && response.data) {
        setTasks((prev) => [response.data!, ...prev]);
        setNewTaskTitle('');
        setNewTaskDescription('');
        setViewMode('tasks');
      } else {
        setTaskError(response.error || 'Failed to create task');
      }
    } catch (err) {
      setTaskError(err instanceof Error ? err.message : 'Failed to create task');
    } finally {
      setIsCreatingTask(false);
    }
  }, [userId, userEmail, newTaskTitle, newTaskDescription, isCreatingTask]);

  // Toggle task completion
  const handleToggleTask = useCallback(async (taskId: number, completed: boolean) => {
    try {
      const response = await updateTaskAction(userId, taskId, { completed: !completed }, userEmail);
      if (response.success) {
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? { ...t, completed: !completed } : t))
        );
      }
    } catch (err) {
      console.error('Failed to toggle task:', err);
    }
  }, [userId, userEmail]);

  // Delete task
  const handleDeleteTask = useCallback(async (taskId: number) => {
    try {
      const response = await deleteTaskAction(userId, taskId, userEmail);
      if (response.success) {
        setTasks((prev) => prev.filter((t) => t.id !== taskId));
      }
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  }, [userId, userEmail]);

  // Handle sending chat message
  const handleSendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return;

      const userMessage: ChatMessage = {
        id: `temp-${Date.now()}`,
        role: 'user',
        content: content.trim(),
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      try {
        const response = await sendChatMessageAction(
          userId,
          content.trim(),
          conversationId || undefined,
          userEmail
        );

        if (response.success && response.data) {
          if (!conversationId && response.data.conversation_id) {
            setConversationId(response.data.conversation_id);
          }

          const assistantMessage: ChatMessage = {
            id: `msg-${Date.now()}`,
            role: 'assistant',
            content: response.data.message,
            created_at: new Date().toISOString(),
          };

          setMessages((prev) => [...prev, assistantMessage]);

          // Refresh tasks after AI response (in case a task was added)
          await refreshTasks();
        } else {
          setMessages((prev) => prev.filter((msg) => msg.id !== userMessage.id));
        }
      } catch (err) {
        console.error('Failed to send message:', err);
        setMessages((prev) => prev.filter((msg) => msg.id !== userMessage.id));
      } finally {
        setIsLoading(false);
      }
    },
    [userId, userEmail, conversationId, isLoading, refreshTasks]
  );

  // Render Dashboard View
  const renderDashboard = () => (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50 p-8 md:p-12 mb-8">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" style={{ animationDelay: '1.5s' }} />
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                                linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
              backgroundSize: '50px 50px',
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-12">
          <div className="flex-shrink-0">
            <RobotAvatar size="xl" />
          </div>

          <div className="flex-1 text-center md:text-left">
            <p className="text-slate-400 text-lg mb-2">
              Hello, <span className="text-cyan-400 font-medium">{userName}</span>
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              <span className="bg-gradient-to-r from-white via-cyan-200 to-cyan-400 bg-clip-text text-transparent">
                Ask Anything
              </span>
            </h1>
            <p className="text-slate-400 text-lg md:text-xl mb-8 max-w-xl">
              Create tasks manually or let AI help you manage your productivity
            </p>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              {/* Manual Add Task */}
              <button
                onClick={() => setViewMode('add-task')}
                className="group relative px-6 py-3 rounded-xl bg-slate-800/80 border border-slate-700 text-white font-semibold hover:bg-slate-700/80 hover:border-slate-600 transition-all duration-300"
              >
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Task
                </span>
              </button>

              {/* AI Add Task */}
              <button
                onClick={() => setViewMode('chat')}
                className="group relative px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold shadow-lg shadow-cyan-500/25 hover:shadow-xl hover:shadow-cyan-500/40 hover:scale-105 active:scale-95 transition-all duration-300 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <span className="relative flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  Add with AI
                </span>
              </button>

              {/* View Tasks */}
              <button
                onClick={() => setViewMode('tasks')}
                className="px-6 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-slate-300 font-semibold hover:bg-slate-700/50 hover:border-cyan-500/50 hover:text-white transition-all duration-300"
              >
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  View Tasks ({totalTasks})
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Tasks"
          value={totalTasks}
          icon="clipboard"
          color="cyan"
        />
        <StatCard
          title="Completed"
          value={completedTasks}
          icon="check"
          color="green"
        />
        <StatCard
          title="Pending"
          value={pendingTasks}
          icon="clock"
          color="yellow"
        />
        <StatCard
          title="Progress"
          value={`${completionRate}%`}
          icon="chart"
          color="blue"
          showProgress
          progress={completionRate}
        />
      </div>

      {/* Recent Tasks Preview */}
      <div className="bg-slate-800/30 border border-slate-700/30 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Recent Tasks</h2>
          <button
            onClick={() => setViewMode('tasks')}
            className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            View All
          </button>
        </div>

        {tasks.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-400">No tasks yet. Create your first task!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {tasks.slice(0, 5).map((task, index) => (
              <TaskItem
                key={task.id}
                task={task}
                index={index}
                onToggle={handleToggleTask}
                onDelete={handleDeleteTask}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // Render Chat View
  const renderChat = () => (
    <div className="animate-fade-in h-[calc(100vh-200px)] flex flex-col">
      {/* Chat Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setViewMode('dashboard')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </button>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-sm text-slate-400">AI Online</span>
        </div>
      </div>

      {/* Chat Container */}
      <div className="flex-1 bg-slate-900/50 border border-slate-800/50 rounded-2xl overflow-hidden flex flex-col">
        {/* Chat Header */}
        <div className="border-b border-slate-800/50 bg-slate-900/80 px-4 py-3">
          <div className="flex items-center gap-3">
            <RobotAvatar size="sm" isThinking={isLoading} />
            <div>
              <h2 className="text-lg font-semibold text-white">Todo Assistant</h2>
              <p className="text-sm text-slate-400">Ask me to add, list, or manage tasks</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4">
          {isChatLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-slate-400 animate-pulse">Loading chat...</div>
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-4">
              <RobotAvatar size="lg" />
              <h3 className="mt-4 text-xl font-bold text-white">Hi! I'm your Todo Assistant</h3>
              <p className="mt-2 text-slate-400">Try saying:</p>
              <div className="mt-4 grid gap-2 w-full max-w-md">
                {[
                  'Add a task to buy groceries',
                  'Show my tasks',
                  'Mark task 1 as complete',
                ].map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSendMessage(suggestion)}
                    className="p-3 rounded-xl text-left bg-slate-800/50 border border-slate-700/50 text-slate-300 text-sm hover:bg-slate-700/50 hover:border-cyan-500/30 transition-all"
                  >
                    "{suggestion}"
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto">
              {messages.map((msg) => (
                <AnimatedMessage
                  key={msg.id}
                  role={msg.role}
                  content={msg.content}
                  timestamp={new Date(msg.created_at)}
                />
              ))}
              {isLoading && <TypingIndicator />}
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-slate-800/50 bg-slate-900/80 p-4">
          <AnimatedChatInput
            onSend={handleSendMessage}
            disabled={isLoading}
            placeholder="Ask me to add, list, or manage your tasks..."
          />
        </div>
      </div>
    </div>
  );

  // Render Tasks View
  const renderTasks = () => (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setViewMode('dashboard')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('add-task')}
            className="px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm hover:bg-slate-700 transition-colors"
          >
            + Add Task
          </button>
          <button
            onClick={() => setViewMode('chat')}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-sm shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all"
          >
            + Add with AI
          </button>
        </div>
      </div>

      <h1 className="text-3xl font-bold text-white mb-6">All Tasks ({totalTasks})</h1>

      {/* Task Filters */}
      <div className="flex gap-2 mb-6">
        <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-400 text-sm border border-cyan-500/30">
          All ({totalTasks})
        </span>
        <span className="px-3 py-1 rounded-full bg-slate-800/50 text-slate-400 text-sm border border-slate-700/50">
          Pending ({pendingTasks})
        </span>
        <span className="px-3 py-1 rounded-full bg-slate-800/50 text-slate-400 text-sm border border-slate-700/50">
          Completed ({completedTasks})
        </span>
      </div>

      {/* Task List */}
      {tasks.length === 0 ? (
        <div className="bg-slate-800/30 border border-slate-700/30 rounded-2xl p-12 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-slate-800 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No tasks yet</h3>
          <p className="text-slate-400 mb-6">Create your first task to get started</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => setViewMode('add-task')}
              className="px-6 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white font-medium hover:bg-slate-700 transition-colors"
            >
              Add Manually
            </button>
            <button
              onClick={() => setViewMode('chat')}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all"
            >
              Add with AI
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task, index) => (
            <TaskItem
              key={task.id}
              task={task}
              index={index}
              showFullDetails
              onToggle={handleToggleTask}
              onDelete={handleDeleteTask}
            />
          ))}
        </div>
      )}
    </div>
  );

  // Render Add Task View
  const renderAddTask = () => (
    <div className="animate-fade-in max-w-xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => setViewMode('dashboard')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </button>
      </div>

      {/* Form Card */}
      <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Create New Task</h1>
            <p className="text-slate-400 text-sm">Add a task manually to your list</p>
          </div>
        </div>

        <form onSubmit={handleCreateTask} className="space-y-6">
          {/* Title Input */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-slate-300 mb-2">
              Task Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              id="title"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="What needs to be done?"
              className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50
                         text-white placeholder-slate-500
                         focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50
                         transition-all"
              maxLength={1000}
              required
              autoFocus
            />
          </div>

          {/* Description Input */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-2">
              Description <span className="text-slate-500">(optional)</span>
            </label>
            <textarea
              id="description"
              value={newTaskDescription}
              onChange={(e) => setNewTaskDescription(e.target.value)}
              placeholder="Add more details about this task..."
              rows={4}
              className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50
                         text-white placeholder-slate-500 resize-none
                         focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50
                         transition-all"
              maxLength={5000}
            />
          </div>

          {/* Error Message */}
          {taskError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {taskError}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4 pt-2">
            <button
              type="button"
              onClick={() => {
                setNewTaskTitle('');
                setNewTaskDescription('');
                setTaskError(null);
                setViewMode('dashboard');
              }}
              className="flex-1 px-6 py-3 rounded-xl bg-slate-800/50 border border-slate-700
                         text-slate-300 font-medium hover:bg-slate-700/50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!newTaskTitle.trim() || isCreatingTask}
              className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500
                         text-white font-medium shadow-lg shadow-cyan-500/25
                         hover:shadow-cyan-500/40
                         disabled:opacity-50 disabled:cursor-not-allowed
                         transition-all"
            >
              {isCreatingTask ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="32" strokeLinecap="round" />
                  </svg>
                  Creating...
                </span>
              ) : (
                'Create Task'
              )}
            </button>
          </div>
        </form>

        {/* Or use AI */}
        <div className="mt-8 pt-6 border-t border-slate-800/50 text-center">
          <p className="text-slate-500 text-sm mb-3">Or let AI help you</p>
          <button
            onClick={() => {
              setNewTaskTitle('');
              setNewTaskDescription('');
              setTaskError(null);
              setViewMode('chat');
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl
                       text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10
                       transition-all text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            Add with AI Assistant
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      {viewMode === 'dashboard' && renderDashboard()}
      {viewMode === 'chat' && renderChat()}
      {viewMode === 'tasks' && renderTasks()}
      {viewMode === 'add-task' && renderAddTask()}
    </div>
  );
}

// Stat Card Component
function StatCard({
  title,
  value,
  icon,
  color,
  showProgress,
  progress,
}: {
  title: string;
  value: number | string;
  icon: string;
  color: 'cyan' | 'green' | 'yellow' | 'blue';
  showProgress?: boolean;
  progress?: number;
}) {
  const colorClasses = {
    cyan: 'bg-cyan-500/10 text-cyan-400',
    green: 'bg-green-500/10 text-green-400',
    yellow: 'bg-yellow-500/10 text-yellow-400',
    blue: 'bg-blue-500/10 text-blue-400',
  };

  const icons = {
    clipboard: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    ),
    check: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    ),
    clock: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    ),
    chart: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    ),
  };

  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5 hover:border-slate-600/50 transition-all">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-400">{title}</p>
          <p className={`mt-1 text-2xl font-bold ${color === 'cyan' ? 'text-white' : colorClasses[color].split(' ')[1]}`}>
            {value}
          </p>
        </div>
        <div className={`w-10 h-10 rounded-lg ${colorClasses[color]} flex items-center justify-center`}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {icons[icon as keyof typeof icons]}
          </svg>
        </div>
      </div>
      {showProgress && progress !== undefined && (
        <div className="mt-3 h-1.5 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}

// Task Item Component
function TaskItem({
  task,
  index,
  showFullDetails,
  onToggle,
  onDelete,
}: {
  task: Task;
  index: number;
  showFullDetails?: boolean;
  onToggle?: (taskId: number, completed: boolean) => void;
  onDelete?: (taskId: number) => void;
}) {
  return (
    <div
      className={`
        group bg-slate-800/50 border rounded-xl p-4
        hover:border-cyan-500/30 transition-all
        animate-fade-in-up
        ${task.completed ? 'border-slate-700/30 opacity-60' : 'border-slate-700/50'}
      `}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex items-center gap-4">
        {/* Checkbox */}
        <button
          onClick={() => onToggle?.(task.id, task.completed)}
          className={`
            w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0
            ${task.completed ? 'bg-green-500 border-green-500' : 'border-slate-600 hover:border-cyan-500'}
            transition-colors cursor-pointer
          `}
        >
          {task.completed && (
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className={`font-medium ${task.completed ? 'text-slate-400 line-through' : 'text-white'}`}>
            {task.title}
          </p>
          {showFullDetails && task.description && (
            <p className="text-sm text-slate-500 mt-1">{task.description}</p>
          )}
        </div>

        {/* Date */}
        <span className="text-xs text-slate-500 flex-shrink-0">
          {new Date(task.created_at).toLocaleDateString()}
        </span>

        {/* Delete button - visible on hover using CSS */}
        {onDelete && (
          <button
            onClick={() => onDelete(task.id)}
            className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10
                       transition-all flex-shrink-0 opacity-0 group-hover:opacity-100"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

export default EnhancedDashboard;
