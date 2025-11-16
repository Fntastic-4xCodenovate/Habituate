/**
 * Socket.IO Client Manager
 * Real-time communication with backend
 */

import { io, Socket } from 'socket.io-client';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000';

class SocketManager {
  private socket: Socket | null = null;
  private userId: string | null = null;

  connect(userId: string) {
    // If already connected with same user, return existing socket
    if (this.socket?.connected && this.userId === userId) {
      return this.socket;
    }

    // If connected but different user, disconnect first
    if (this.socket && this.userId !== userId) {
      this.disconnect();
    }

    this.userId = userId;
    this.socket = io(WS_URL, {
      transports: ['websocket', 'polling'],
      query: { user_id: userId },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket connected');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.userId = null;
    }
  }

  // Clan Chat
  joinClanRoom(clanId: string, userId: string, userName: string) {
    this.socket?.emit('join_clan_room', { 
      clanId,
      userId, 
      userName 
    });
  }

  leaveClanRoom(clanId: string, userId: string, userName: string) {
    this.socket?.emit('leave_clan_room', { 
      clanId,
      userId,
      userName 
    });
  }

  sendClanMessage(clanId: string, userId: string, userName: string, message: string, avatar?: string) {
    this.socket?.emit('clan_message', {
      clanId,
      userId,
      userName,
      message,
      avatar: avatar || '/avatars/default.png'
    });
  }

  onClanMessage(callback: (data: {
    id: string;
    clanId: string;
    userId: string;
    userName: string;
    message: string;
    timestamp: string;
    avatar?: string;
  }) => void) {
    // Remove existing listener first to prevent duplicates
    this.socket?.off('new_clan_message');
    this.socket?.on('new_clan_message', callback);
  }

  offClanMessage() {
    this.socket?.off('new_clan_message');
  }

  onUserJoinedClan(callback: (data: { userId: string; userName: string; timestamp: string }) => void) {
    this.socket?.off('user_joined_clan');
    this.socket?.on('user_joined_clan', callback);
  }

  offUserJoinedClan() {
    this.socket?.off('user_joined_clan');
  }

  onUserLeftClan(callback: (data: { userId: string; userName: string; timestamp: string }) => void) {
    this.socket?.off('user_left_clan');
    this.socket?.on('user_left_clan', callback);
  }

  offUserLeftClan() {
    this.socket?.off('user_left_clan');
  }

  // XP Updates
  onXPUpdate(callback: (data: {
    user_id: string;
    xp_earned: number;
    new_total_xp: number;
    level_up: boolean;
    new_level?: number;
  }) => void) {
    this.socket?.on('xp_update', callback);
  }

  // Badge Earned
  onBadgeEarned(callback: (data: {
    user_id: string;
    badge_id: string;
    badge_name: string;
    badge_icon: string;
  }) => void) {
    this.socket?.on('badge_earned', callback);
  }

  // Streak Milestone
  onStreakMilestone(callback: (data: {
    user_id: string;
    habit_id: string;
    habit_title: string;
    streak: number;
    milestone: number;
  }) => void) {
    this.socket?.on('streak_milestone', callback);
  }

  getSocket() {
    return this.socket;
  }

  isConnected() {
    return this.socket?.connected || false;
  }
}

// Singleton instance
export const socketManager = new SocketManager();
