'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { useClanChat } from '@/hooks/useClanChat';

interface ClanChatProps {
  clanId: string;
  userId: string;
  userName: string;
}

export default function ClanChat({ clanId, userId, userName }: ClanChatProps) {
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages, sendMessage, isConnected, isLoading } = useClanChat(clanId, userId, userName);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (message.trim()) {
      sendMessage(message);
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getTimeAgo = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
      
      if (seconds < 60) return 'just now';
      if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
      if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
      return `${Math.floor(seconds / 86400)}d ago`;
    } catch {
      return 'just now';
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Connection Status */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <span>Clan Chat</span>
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
        </h2>
        {!isConnected && (
          <span className="text-sm text-yellow-400">Reconnecting...</span>
        )}
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="animate-spin text-purple-400" size={32} />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <>
            {messages.map((msg) => {
              const isOwnMessage = msg.user_id === userId;
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : ''}`}
                >
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                    {msg.username?.[0]?.toUpperCase() || '?'}
                  </div>

                  {/* Message Content */}
                  <div className={`flex-1 max-w-[70%] ${isOwnMessage ? 'items-end' : ''}`}>
                    <div className={`flex items-center gap-2 mb-1 ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
                      <span className="font-semibold text-sm">
                        {isOwnMessage ? 'You' : msg.username}
                      </span>
                      <span className="text-xs text-gray-500">
                        {getTimeAgo(msg.timestamp)}
                      </span>
                    </div>
                    <div
                      className={`rounded-lg p-3 ${
                        isOwnMessage
                          ? 'bg-purple-600 text-white'
                          : 'bg-black/40 text-gray-300'
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={isConnected ? "Type a message..." : "Connecting..."}
          disabled={!isConnected}
          className="flex-1 px-4 py-3 bg-black/40 border border-purple-500/30 rounded-lg focus:outline-none focus:border-purple-500 text-white placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
          maxLength={500}
        />
        <button
          onClick={handleSendMessage}
          disabled={!message.trim() || !isConnected}
          className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-purple-600 flex items-center gap-2"
        >
          <Send size={20} />
          <span className="hidden sm:inline">Send</span>
        </button>
      </div>

      {/* Character Count */}
      {message.length > 0 && (
        <div className="text-xs text-gray-500 text-right mt-1">
          {message.length}/500
        </div>
      )}
    </div>
  );
}
