'use client';

import { useEffect, useState, useCallback } from 'react';
import { socketManager } from '@/lib/socket';

export interface ClanMessage {
  id: string;
  clan_id: string;
  user_id: string;
  username: string;
  message: string;
  timestamp: string;
  avatar?: string;
}

export const useClanChat = (clanId: string, userId: string, userName: string) => {
  const [messages, setMessages] = useState<ClanMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load existing messages from backend
  const loadMessages = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`http://localhost:8000/api/clans/${clanId}/messages`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Error loading clan messages:', error);
    } finally {
      setIsLoading(false);
    }
  }, [clanId]);

  useEffect(() => {
    if (!userId || !clanId || !userName) return;

    let isMounted = true;

    // Connect socket
    const socket = socketManager.connect(userId);
    
    // Update connection status
    const updateConnectionStatus = () => {
      if (isMounted) {
        setIsConnected(socketManager.isConnected());
      }
    };

    socket.on('connect', updateConnectionStatus);
    socket.on('disconnect', updateConnectionStatus);
    updateConnectionStatus();

    // Join clan room
    socketManager.joinClanRoom(clanId, userId, userName);

    // Load existing messages
    loadMessages();

    // Listen for new messages
    const handleNewMessage = (data: {
      id: string;
      clanId: string;
      userId: string;
      userName: string;
      message: string;
      timestamp: string;
      avatar?: string;
    }) => {
      if (!isMounted) return;
      setMessages(prev => [...prev, {
        id: data.id,
        clan_id: data.clanId,
        user_id: data.userId,
        username: data.userName,
        message: data.message,
        timestamp: data.timestamp,
        avatar: data.avatar,
      }]);
    };

    const handleUserJoined = (data: { userId: string; userName: string; timestamp: string }) => {
      if (!isMounted) return;
      console.log(`👥 ${data.userName} joined the clan`);
    };

    const handleUserLeft = (data: { userId: string; userName: string; timestamp: string }) => {
      if (!isMounted) return;
      console.log(`👋 ${data.userName} left the clan`);
    };

    socketManager.onClanMessage(handleNewMessage);
    socketManager.onUserJoinedClan(handleUserJoined);
    socketManager.onUserLeftClan(handleUserLeft);

    // Cleanup on unmount
    return () => {
      isMounted = false;
      socket.off('connect', updateConnectionStatus);
      socket.off('disconnect', updateConnectionStatus);
      socketManager.offClanMessage();
      socketManager.offUserJoinedClan();
      socketManager.offUserLeftClan();
      socketManager.leaveClanRoom(clanId, userId, userName);
      // Note: We don't disconnect the socket here as it might be used elsewhere
    };
  }, [userId, clanId, userName, loadMessages]);

  const sendMessage = useCallback((message: string, avatar?: string) => {
    if (!message.trim() || !clanId) return;
    
    socketManager.sendClanMessage(clanId, userId, userName, message.trim(), avatar);
  }, [clanId, userId, userName]);

  const refreshMessages = useCallback(() => {
    loadMessages();
  }, [loadMessages]);

  return {
    messages,
    sendMessage,
    isConnected,
    isLoading,
    refreshMessages,
  };
};
