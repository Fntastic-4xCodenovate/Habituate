import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database Types
export interface Habit {
  id: string;
  user_id: string;
  title: string;
  description: string;
  frequency: 'daily' | 'weekly';
  difficulty?: 'easy' | 'medium' | 'hard';
  streak: number;
  best_streak: number;
  last_completed_date?: string;
  is_active?: boolean;
  created_at: string;
  updated_at?: string;
}

export interface HabitLog {
  id: string;
  habit_id: string;
  user_id: string;
  completed_at: string;
  notes?: string;
}

export interface UserProfile {
  id: string;
  clerk_user_id: string;
  username: string;
  avatar_url?: string;
  total_points: number;
  level: number;
  created_at: string;
  updated_at: string;
}

// Supabase Queries
export const getHabits = async (userId: string) => {
  const { data, error } = await supabase
    .from('habits')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data as Habit[];
};

export const createHabit = async (habit: Omit<Habit, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('habits')
    .insert(habit)
    .select()
    .single();
  
  if (error) throw error;
  return data as Habit;
};

export const logHabitCompletion = async (habitId: string, userId: string, notes?: string) => {
  const { data, error } = await supabase
    .from('habit_logs')
    .insert({
      habit_id: habitId,
      user_id: userId,
      notes,
      completed_at: new Date().toISOString(),
    })
    .select()
    .single();
  
  if (error) throw error;
  return data as HabitLog;
};

export const getUserProfile = async (clerkUserId: string) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('clerk_user_id', clerkUserId)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error;
  return data as UserProfile | null;
};

export const createUserProfile = async (profile: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .insert(profile)
    .select()
    .single();
  
  if (error) throw error;
  return data as UserProfile;
};

export const updateUserAvatar = async (clerkUserId: string, avatarUrl: string) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .update({ avatar_url: avatarUrl, updated_at: new Date().toISOString() })
    .eq('clerk_user_id', clerkUserId)
    .select()
    .single();
  
  if (error) throw error;
  return data as UserProfile;
};

export const getLeaderboard = async (limit: number = 10) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .order('total_points', { ascending: false })
    .limit(limit);
  
  if (error) throw error;
  return data as UserProfile[];
};

// Storage helpers
export const uploadAvatar = async (file: File, userId: string) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}-${Date.now()}.${fileExt}`;
  const filePath = `avatars/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  const { data } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath);

  return data.publicUrl;
};
