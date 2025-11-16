# 🔗 Backend Integration Guide

This guide explains how to integrate the FastAPI backend with your Next.js frontend.

## 📋 Table of Contents
1. [Setup](#setup)
2. [API Integration](#api-integration)
3. [Socket.IO Integration](#socketio-integration)

5. [New Features](#new-features)

## 🚀 Setup

### 1. Install Backend Dependencies

```powershell
cd backend
pip install -r requirements.txt
```

### 2. Configure Backend Environment

Create `backend/.env`:
```env
# Supabase (use same credentials as frontend)
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_service_role_key
SUPABASE_JWT_SECRET=your_jwt_secret



# Server
SECRET_KEY=your_random_secret_key
DEBUG=True
FRONTEND_URL=http://localhost:3000
```

### 3. Update Frontend Environment

Add to `.env.local`:
```env
# Backend API
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000

# PostHog (Frontend)
NEXT_PUBLIC_POSTHOG_KEY=phc_your_key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

### 4. Install Frontend Socket.IO Client

```powershell
npm install socket.io-client
```

### 5. Run Database Migration

In Supabase SQL Editor, run:
```sql
-- Run the contents of supabase/enhanced_schema.sql
```

## 🔌 API Integration

### Create API Client (`lib/api.ts`)

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class HabituateAPI {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_URL;
  }

  // Auth
  async registerUser(clerkUserId: string, username: string, email: string) {
    const response = await fetch(`${this.baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clerk_user_id: clerkUserId,
        username,
        email
      })
    });
    return response.json();
  }

  // Habits
  async completeHabit(habitId: string, userId: string, notes?: string) {
    const response = await fetch(
      `${this.baseUrl}/api/habits/${habitId}/complete?user_id=${userId}${notes ? `&notes=${notes}` : ''}`,
      { method: 'POST' }
    );
    return response.json();
  }

  async useExtraLife(userId: string, habitId: string, dateToRestore: string) {
    const response = await fetch(`${this.baseUrl}/api/habits/extra-life/use`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId,
        habit_id: habitId,
        date_to_restore: dateToRestore
      })
    });
    return response.json();
  }

  async checkMissedDays(userId: string) {
    const response = await fetch(`${this.baseUrl}/api/habits/missed-days/${userId}`);
    return response.json();
  }

  // Profile
  async getUserProfile(userId: string) {
    const response = await fetch(`${this.baseUrl}/api/profile/${userId}`);
    return response.json();
  }

  async getUserStats(userId: string) {
    const response = await fetch(`${this.baseUrl}/api/profile/${userId}/stats`);
    return response.json();
  }

  // Badges
  async getUserBadges(userId: string) {
    const response = await fetch(`${this.baseUrl}/api/badges/user/${userId}`);
    return response.json();
  }

  async getBadgeProgress(userId: string) {
    const response = await fetch(`${this.baseUrl}/api/badges/user/${userId}/progress`);
    return response.json();
  }

  async checkBadges(userId: string) {
    const response = await fetch(`${this.baseUrl}/api/badges/check/${userId}`, {
      method: 'POST'
    });
    return response.json();
  }

  // Clans
  async createClan(ownerId: string, name: string, description: string, icon: string) {
    const response = await fetch(`${this.baseUrl}/api/clans/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        owner_id: ownerId,
        name,
        description,
        icon
      })
    });
    return response.json();
  }

  async joinClan(clanId: string, userId: string, username: string) {
    const response = await fetch(
      `${this.baseUrl}/api/clans/${clanId}/join?user_id=${userId}&username=${username}`,
      { method: 'POST' }
    );
    return response.json();
  }

  async getClanStats(clanId: string) {
    const response = await fetch(`${this.baseUrl}/api/clans/${clanId}/stats`);
    return response.json();
  }

  async getClanMessages(clanId: string, limit: number = 50) {
    const response = await fetch(`${this.baseUrl}/api/clans/${clanId}/messages?limit=${limit}`);
    return response.json();
  }

  // Leaderboards
  async getUserLeaderboard(limit: number = 100) {
    const response = await fetch(`${this.baseUrl}/api/leaderboard/users?limit=${limit}`);
    return response.json();
  }

  async getClanLeaderboard(limit: number = 50) {
    const response = await fetch(`${this.baseUrl}/api/leaderboard/clans?limit=${limit}`);
    return response.json();
  }

  // Discover
  async discoverHabits(category?: string, difficulty?: string) {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (difficulty) params.append('difficulty', difficulty);
    
    const response = await fetch(`${this.baseUrl}/api/discover/habits?${params}`);
    return response.json();
  }

  async adoptHabit(habitId: string, userId: string) {
    const response = await fetch(
      `${this.baseUrl}/api/discover/habits/${habitId}/adopt?user_id=${userId}`,
      { method: 'POST' }
    );
    return response.json();
  }
}

export const api = new HabituateAPI();
```

## 🔌 Socket.IO Integration

### Create Socket Client (`lib/socket.ts`)

```typescript
'use client';

import { io, Socket } from 'socket.io-client';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000';

class SocketManager {
  private socket: Socket | null = null;

  connect(userId: string) {
    if (this.socket) return;

    this.socket = io(WS_URL, {
      transports: ['websocket'],
      query: { user_id: userId }
    });

    this.socket.on('connect', () => {
      console.log('✅ Connected to HABITUATE backend');
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Disconnected from backend');
    });

    return this.socket;
  }

  joinClanRoom(clanId: string) {
    if (!this.socket) return;
    this.socket.emit('join_clan_room', { clan_id: clanId });
  }

  sendClanMessage(clanId: string, userId: string, message: string) {
    if (!this.socket) return;
    this.socket.emit('clan_message', {
      clan_id: clanId,
      user_id: userId,
      message,
      timestamp: new Date().toISOString()
    });
  }

  onClanMessage(callback: (data: any) => void) {
    if (!this.socket) return;
    this.socket.on('new_clan_message', callback);
  }

  onMemberJoined(callback: (data: any) => void) {
    if (!this.socket) return;
    this.socket.on('member_joined', callback);
  }

  onNotification(callback: (data: any) => void) {
    if (!this.socket) return;
    this.socket.on('notification', callback);
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const socketManager = new SocketManager();
```

### Use in Components

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { socketManager } from '@/lib/socket';

export default function ClanChat({ clanId }: { clanId: string }) {
  const { user } = useUser();
  const [messages, setMessages] = useState<any[]>([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!user) return;

    // Connect and join clan room
    socketManager.connect(user.id);
    socketManager.joinClanRoom(clanId);

    // Listen for new messages
    socketManager.onClanMessage((data) => {
      setMessages(prev => [...prev, data]);
    });

    return () => {
      socketManager.disconnect();
    };
  }, [user, clanId]);

  const sendMessage = () => {
    if (!user || !message.trim()) return;
    
    socketManager.sendClanMessage(clanId, user.id, message);
    setMessage('');
  };

  return (
    <div className="clan-chat">
      <div className="messages">
        {messages.map((msg, idx) => (
          <div key={idx} className="message">
            <strong>{msg.username}:</strong> {msg.message}
          </div>
        ))}
      </div>
      
      <div className="input">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}
```



## 🎯 New Features to Implement

### 1. Clan Page (`app/clans/[id]/page.tsx`)

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import ClanChat from '@/components/ClanChat';

export default function ClanPage() {
  const params = useParams();
  const [clan, setClan] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadClan();
  }, [params.id]);

  const loadClan = async () => {
    const clanData = await api.getClan(params.id as string);
    const statsData = await api.getClanStats(params.id as string);
    
    setClan(clanData);
    setStats(statsData);
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold">{clan?.name}</h1>
      
      <div className="stats grid grid-cols-4 gap-4 my-8">
        <StatCard title="Total XP" value={stats?.total_xp} />
        <StatCard title="Level" value={stats?.level} />
        <StatCard title="Members" value={stats?.member_count} />
        <StatCard title="Rank" value={`#${stats?.rank}`} />
      </div>

      <div className="grid grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-bold mb-4">Top Contributors</h2>
          {stats?.top_contributors.map((member: any) => (
            <div key={member.id} className="contributor-card">
              {member.username}: {member.xp_contributed} XP
            </div>
          ))}
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">Clan Chat</h2>
          <ClanChat clanId={params.id as string} />
        </div>
      </div>
    </div>
  );
}
```

### 2. Discover Habits Page (`app/discover/page.tsx`)

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { api } from '@/lib/api';

export default function DiscoverPage() {
  const { user } = useUser();
  const [habits, setHabits] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    loadHabits();
    loadCategories();
  }, []);

  const loadHabits = async () => {
    const data = await api.discoverHabits();
    setHabits(data.habits);
  };

  const loadCategories = async () => {
    const data = await api.getHabitCategories();
    setCategories(data.categories);
  };

  const adoptHabit = async (habitId: string) => {
    if (!user) return;
    const result = await api.adoptHabit(habitId, user.id);
    
    if (result.success) {
      alert('Habit adopted successfully!');
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8">Discover Habits</h1>

      <div className="categories mb-8">
        {categories.map((cat) => (
          <button key={cat.name} className="category-btn">
            {cat.icon} {cat.name}
          </button>
        ))}
      </div>

      <div className="habits-grid grid grid-cols-3 gap-6">
        {habits.map((habit) => (
          <div key={habit.id} className="habit-card">
            <h3>{habit.title}</h3>
            <p>{habit.description}</p>
            <div className="stats">
              <span>Difficulty: {habit.difficulty}</span>
              <span>Completions: {habit.total_completions}</span>
            </div>
            <button onClick={() => adoptHabit(habit.id)}>
              Adopt Habit
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 3. Enhanced Dashboard with XP/Badges

Update `app/dashboard/page.tsx`:

```typescript
import { api } from '@/lib/api';

// Add to dashboard
const [stats, setStats] = useState<any>(null);
const [badges, setBadges] = useState<any[]>([]);
const [missedDays, setMissedDays] = useState<any[]>([]);

useEffect(() => {
  if (user) {
    loadEnhancedData();
  }
}, [user]);

const loadEnhancedData = async () => {
  const statsData = await api.getUserStats(user.id);
  const badgesData = await api.getUserBadges(user.id);
  const missedData = await api.checkMissedDays(user.id);
  
  setStats(statsData);
  setBadges(badgesData.badges);
  setMissedDays(missedData.missed_days);
};

// Add XP progress bar
<div className="xp-section">
  <h2>Level {stats?.level}</h2>
  <ProgressBar 
    current={stats?.total_xp % calculateXPForLevel(stats?.level + 1)}
    max={calculateXPForLevel(stats?.level + 1)}
  />
  <p>{stats?.total_xp} Total XP</p>
</div>

// Add badges section
<div className="badges-section">
  <h2>Recent Badges</h2>
  {badges.slice(0, 5).map((badge) => (
    <BadgeCard key={badge.id} badge={badge.badge_details} />
  ))}
</div>

// Add extra life notifications
{missedDays.length > 0 && (
  <div className="missed-days-alert">
    <h3>⚠️ Missed Days Detected</h3>
    {missedDays.map((missed) => (
      <div key={missed.habit_id}>
        <p>{missed.habit_title} - {missed.days_missed} days missed</p>
        {missed.can_use_extra_life && (
          <button onClick={() => useExtraLife(missed.habit_id)}>
            Use Extra Life 💎
          </button>
        )}
      </div>
    ))}
  </div>
)}
```

## 🚦 Running Both Servers

### Option 1: Separate Terminals

**Terminal 1 (Frontend)**:
```powershell
npm run dev
```

**Terminal 2 (Backend)**:
```powershell
cd backend
python -m uvicorn main:socket_app --reload
```

### Option 2: PowerShell Script

Create `start-all.ps1`:
```powershell
# Start both frontend and backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; python -m uvicorn main:socket_app --reload"
```

Run:
```powershell
.\start-all.ps1
```

## ✅ Integration Checklist

- [ ] Backend dependencies installed
- [ ] Backend `.env` configured
- [ ] Frontend `.env.local` updated with API URLs
- [ ] Socket.IO client installed (`socket.io-client`)

- [ ] Database migration run (enhanced_schema.sql)
- [ ] API client created (`lib/api.ts`)
- [ ] Socket manager created (`lib/socket.ts`)
- [ ] PostHog provider added to layout
- [ ] Both servers running simultaneously
- [ ] Test API connection (health check)
- [ ] Test Socket.IO connection (clan chat)
- [ ] Test PostHog events (check dashboard)

## 🎉 You're Ready!

Your HABITUATE app now has:
- ✅ XP & Leveling system
- ✅ Badge achievements
- ✅ Clan system with chat
- ✅ Extra lives for streak protection
- ✅ Quest system
- ✅ Habit discovery
- ✅ Real-time notifications
- ✅ Analytics tracking

Next steps:
1. Create new pages for clans and discovery
2. Add badge notifications
3. Implement quest tracking UI
4. Add XP animations
5. Create leaderboard visualizations
