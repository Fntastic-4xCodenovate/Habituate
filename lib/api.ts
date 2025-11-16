/**
 * Backend API Client
 * Connects frontend to FastAPI backend for gamification features
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Types
export interface User {
  id: string;
  clerk_user_id: string;
  username: string;
  email: string;
  xp: number;
  level: number;
  clan_id?: string;
  extra_lives?: number;
  created_at: string;
  updated_at: string;
}

export interface HabitWithBackend {
  id: string;
  user_id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  frequency: 'daily' | 'weekly';
  streak: number;
  best_streak: number;
  last_completed_date?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'streak' | 'completion' | 'level' | 'social' | 'clan' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  requirement_type: string;
  requirement_value: number;
}

export interface UserBadge {
  badge_id: string;
  badge: Badge;
  earned_at: string;
  progress?: number;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  quest_type: 'daily' | 'weekly';
  xp_reward: number;
  requirement_type: string;
  requirement_value: number;
}

export interface UserQuest {
  quest_id: string;
  quest: Quest;
  progress: number;
  completed: boolean;
  completed_at?: string;
}

// API Error Handler
class APIError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'APIError';
  }
}

async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new APIError(response.status, error.detail || 'Request failed');
  }

  return response.json();
}

// Auth API
export const authAPI = {
  register: async (clerkUserId: string, email: string, username: string) => {
    return fetchAPI<User>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ clerk_user_id: clerkUserId, email, username }),
    });
  },

  getUser: async (clerkUserId: string) => {
    return fetchAPI<User>(`/auth/user/${clerkUserId}`);
  },
};

// Habits API
export const habitsAPI = {
  getAll: async (userId: string) => {
    return fetchAPI<HabitWithBackend[]>(`/habits/?user_id=${userId}`);
  },

  create: async (habitData: {
    user_id: string;
    title: string;
    description: string;
    difficulty: 'easy' | 'medium' | 'hard';
    frequency: 'daily' | 'weekly';
  }) => {
    return fetchAPI<HabitWithBackend>('/habits/', {
      method: 'POST',
      body: JSON.stringify(habitData),
    });
  },

  complete: async (habitId: string, userId: string) => {
    return fetchAPI<{
      habit: HabitWithBackend;
      xp_earned: number;
      level_up: boolean;
      new_level?: number;
      streak_bonus: number;
      badges_earned: Badge[];
    }>(`/habits/${habitId}/complete`, {
      method: 'POST',
      body: JSON.stringify({ user_id: userId }),
    });
  },

  delete: async (habitId: string, userId: string) => {
    return fetchAPI<{ message: string }>(`/habits/${habitId}?user_id=${userId}`, {
      method: 'DELETE',
    });
  },
};

// Profile API
export const profileAPI = {
  getProfile: async (userId: string) => {
    return fetchAPI<User>(`/profile/${userId}`);
  },

  getStats: async (userId: string) => {
    return fetchAPI<{
      total_habits: number;
      total_completions: number;
      current_streak: number;
      longest_streak: number;
      total_xp: number;
      level: number;
      badges_earned: number;
      clan_xp_contribution: number;
    }>(`/profile/${userId}/stats`);
  },

  getLevelProgress: async (userId: string) => {
    return fetchAPI<{
      current_level: number;
      next_level: number;
      current_xp: number;
      xp_into_level: number;
      xp_needed_for_next: number;
      xp_required_for_level: number;
      progress_percentage: number;
    }>(`/profile/${userId}/level-progress`);
  },

  getActivity: async (userId: string, days: number = 30) => {
    return fetchAPI<{
      date: string;
      completions: number;
      xp_earned: number;
    }[]>(`/profile/${userId}/activity?days=${days}`);
  },
};

// Badges API
export const badgesAPI = {
  getUserBadges: async (userId: string) => {
    return fetchAPI<UserBadge[]>(`/badges/${userId}`);
  },

  getBadgeProgress: async (userId: string) => {
    return fetchAPI<{
      badge: Badge;
      progress: number;
      earned: boolean;
    }[]>(`/badges/${userId}/progress`);
  },
};

// Leaderboard API
export const leaderboardAPI = {
  getUsers: async (limit: number = 10) => {
    return fetchAPI<(User & { rank: number })[]>(`/leaderboard/users?limit=${limit}`);
  },

  getClans: async (limit: number = 10) => {
    return fetchAPI<{
      id: string;
      name: string;
      description: string;
      total_xp: number;
      level: number;
      member_count: number;
      rank: number;
    }[]>(`/leaderboard/clans?limit=${limit}`);
  },
};

// Quests API
export const questsAPI = {
  getUserQuests: async (userId: string) => {
    return fetchAPI<UserQuest[]>(`/quests/${userId}`);
  },
};

// Discover API
export const discoverAPI = {
  getPopularHabits: async (limit: number = 20) => {
    return fetchAPI<{
      title: string;
      description: string;
      category: string;
      adoption_count: number;
    }[]>(`/discover/habits?limit=${limit}`);
  },

  adoptHabit: async (userId: string, habitTemplate: {
    title: string;
    description: string;
    difficulty: 'easy' | 'medium' | 'hard';
  }) => {
    return fetchAPI<HabitWithBackend>('/discover/adopt', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, ...habitTemplate }),
    });
  },
};

export { API_URL, APIError };
