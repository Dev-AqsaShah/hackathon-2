'use client';

/**
 * Chat Container Component
 *
 * Main container managing chat state and API communication.
 * Per constitution: Frontend must not contain business logic.
 * All task operations happen via backend agent + MCP tools.
 */

import { useState, useEffect, useCallback } from 'react';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import {
  sendChatMessageAction,
  getChatHistoryAction,
  type ChatMessage,
} from '@/lib/actions/chat-actions';

interface ChatContainerProps {
  userId: string;
  userEmail?: string;
}

export function ChatContainer({ userId, userEmail }: ChatContainerProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        // Don't show error for initial load - just start fresh
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

      // Create optimistic user message
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
          // Update conversation ID if this is first message
          if (!conversationId && response.data.conversation_id) {
            setConversationId(response.data.conversation_id);
          }

          // Add assistant response
          const assistantMessage: ChatMessage = {
            id: `msg-${Date.now()}`,
            role: 'assistant',
            content: response.data.message,
            created_at: new Date().toISOString(),
          };

          setMessages((prev) => [...prev, assistantMessage]);
        } else {
          setError(response.error || 'Failed to send message');
          // Remove optimistic message on error
          setMessages((prev) =>
            prev.filter((msg) => msg.id !== userMessage.id)
          );
        }
      } catch (err) {
        console.error('Failed to send message:', err);
        setError('Failed to send message. Please try again.');
        // Remove optimistic message on error
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
      <div className="flex flex-col h-full bg-white dark:bg-gray-900">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-500 dark:text-gray-400">
            Loading conversation...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="border-b px-4 py-3 bg-gray-50 dark:bg-gray-800">
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
          Todo Assistant
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Manage your tasks with natural language
        </p>
      </div>

      {/* Error banner */}
      {error && (
        <div className="px-4 py-2 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Message list */}
      <MessageList messages={messages} isLoading={isLoading} />

      {/* Input */}
      <MessageInput
        onSend={handleSendMessage}
        disabled={isLoading}
        placeholder="Ask me to add, list, or manage your tasks..."
      />
    </div>
  );
}

export default ChatContainer;
