'use client';

/**
 * Animated Chat Container Component
 *
 * Features:
 * - Full chat interface with animations
 * - Auto-scroll to latest message
 * - Typing indicator
 * - Empty state with robot
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { AnimatedMessage } from './AnimatedMessage';
import { AnimatedChatInput } from './AnimatedChatInput';
import { TypingIndicator } from './TypingIndicator';
import { RobotAvatar } from '@/components/ui/RobotAvatar';
import {
  sendChatMessageAction,
  getChatHistoryAction,
  type ChatMessage,
} from '@/lib/actions/chat-actions';

interface AnimatedChatContainerProps {
  userId: string;
  userEmail?: string;
}

export function AnimatedChatContainer({ userId, userEmail }: AnimatedChatContainerProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Load chat history on mount
  useEffect(() => {
    async function loadHistory() {
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
        setIsInitialLoading(false);
      }
    }

    loadHistory();
  }, [userId, userEmail]);

  // Send message handler
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
      setError(null);

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
        } else {
          setError(response.error || 'Failed to send message');
          setMessages((prev) => prev.filter((msg) => msg.id !== userMessage.id));
        }
      } catch (err) {
        console.error('Failed to send message:', err);
        setError('Failed to send message. Please try again.');
        setMessages((prev) => prev.filter((msg) => msg.id !== userMessage.id));
      } finally {
        setIsLoading(false);
      }
    },
    [userId, userEmail, conversationId, isLoading]
  );

  // Initial loading state
  if (isInitialLoading) {
    return (
      <div className="flex flex-col h-full bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <RobotAvatar size="lg" isThinking />
          <p className="text-slate-400 animate-pulse">Loading conversation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-slate-900 to-slate-950">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-slate-800/50 bg-slate-900/80 backdrop-blur-sm px-4 py-3">
        <div className="flex items-center gap-3">
          <RobotAvatar size="sm" />
          <div>
            <h1 className="text-lg font-semibold text-white">Todo Assistant</h1>
            <p className="text-sm text-slate-400">AI-powered task management</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs text-slate-400">Online</span>
          </div>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex-shrink-0 px-4 py-2 bg-red-500/10 border-b border-red-500/20 animate-fade-in">
          <p className="text-sm text-red-400 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </p>
        </div>
      )}

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {messages.length === 0 ? (
          // Empty state
          <div className="h-full flex flex-col items-center justify-center text-center px-4">
            <RobotAvatar size="xl" />
            <h2 className="mt-6 text-2xl font-bold text-white">
              Hi! I'm your Todo Assistant
            </h2>
            <p className="mt-2 text-slate-400 max-w-md">
              I can help you manage your tasks. Try saying:
            </p>
            <div className="mt-6 grid gap-3 w-full max-w-md">
              {[
                'Add a task to buy groceries',
                'Show me my tasks',
                'Mark task 1 as complete',
                'Delete task 2',
              ].map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSendMessage(suggestion)}
                  className="
                    p-3 rounded-xl text-left
                    bg-slate-800/50 border border-slate-700/50
                    text-slate-300 text-sm
                    hover:bg-slate-700/50 hover:border-cyan-500/30
                    transition-all duration-200
                    animate-fade-in-up
                  "
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <span className="text-cyan-400">"</span>
                  {suggestion}
                  <span className="text-cyan-400">"</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          // Message list
          <div className="max-w-3xl mx-auto">
            {messages.map((msg, index) => (
              <AnimatedMessage
                key={msg.id}
                role={msg.role}
                content={msg.content}
                timestamp={new Date(msg.created_at)}
                isNew={index === messages.length - 1}
              />
            ))}

            {/* Typing indicator */}
            {isLoading && <TypingIndicator />}

            {/* Scroll anchor */}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="flex-shrink-0 border-t border-slate-800/50 bg-slate-900/80 backdrop-blur-sm p-4">
        <div className="max-w-3xl mx-auto">
          <AnimatedChatInput
            onSend={handleSendMessage}
            disabled={isLoading}
            placeholder="Ask me to add, list, or manage your tasks..."
          />
        </div>
      </div>
    </div>
  );
}

export default AnimatedChatContainer;
