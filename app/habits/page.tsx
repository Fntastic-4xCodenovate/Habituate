'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, CheckCircle2, Flame, Trophy, Heart, Zap, Star } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { habitsAPI, type HabitWithBackend } from '@/lib/api';
import { supabase } from '@/lib/supabase';

// Predefined habits list
const POSITIVE_HABITS = [
  { value: 'gym', label: 'Gym', description: 'Physical exercise and fitness' },
  { value: 'leetcode', label: 'LeetCode', description: 'Coding practice and problem solving' },
  { value: 'healthy_eating', label: 'Healthy Eating', description: 'Nutritious meal choices' },
  { value: 'bedtime', label: 'Bedtime Routine', description: 'Consistent sleep schedule' },
  { value: 'reading', label: 'Reading', description: 'Daily reading habit' },
];

const NEGATIVE_HABITS = [
  { value: 'screen_time', label: 'Limit Screen Time', description: 'Reduce excessive device usage' },
  { value: 'smoking', label: 'Quit Smoking', description: 'Reduce or eliminate smoking' },
  { value: 'drinking', label: 'Limit Drinking', description: 'Reduce alcohol consumption' },
  { value: 'swearing', label: 'Stop Swearing', description: 'Eliminate profanity' },
];

const ALL_HABITS = [...POSITIVE_HABITS, ...NEGATIVE_HABITS];

export default function HabitsPage() {
  const { user, isLoaded } = useUser();
  const [habits, setHabits] = useState<HabitWithBackend[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showNewHabitForm, setShowNewHabitForm] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'xp' | 'levelup' | 'badge' | 'streak';
    message: string;
  } | null>(null);

  useEffect(() => {
    if (isLoaded && user) {
      loadHabits();
    }
  }, [isLoaded, user]);

  const loadHabits = async () => {
    try {
      if (!user) return;
      
      // Get user profile from Supabase
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('id, profile_completed')
        .eq('clerk_user_id', user.id)
        .single();
      
      if (profileError || !profile || !profile.profile_completed) {
        // User hasn't completed onboarding
        setLoading(false);
        return;
      }
      
      setUserProfile(profile);
      
      // Load ONLY user's own habits from Supabase
      const { data, error } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', profile.id) // Only user's own habits
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setHabits(data || []);
    } catch (error) {
      console.error('Error loading habits:', error);
      setNotification({ type: 'xp', message: 'Failed to load habits' });
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteHabit = async (habitId: string) => {
    try {
      if (!user) return;
      
      // Get user profile ID
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('clerk_user_id', user.id)
        .single();
      
      if (!profile) return;
      
      // Get the habit to update
      const habit = habits.find(h => h.id === habitId);
      if (!habit) return;
      
      // Check if habit was already completed today
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      
      if (habit.last_completed_date === today) {
        setNotification({
          type: 'xp',
          message: 'Habit already completed today! Come back tomorrow.',
        });
        setTimeout(() => setNotification(null), 3000);
        return;
      }
      
      // Double check in habit logs to prevent race conditions
      const { data: existingLog } = await supabase
        .from('habit_logs')
        .select('id')
        .eq('habit_id', habitId)
        .eq('user_id', profile.id)
        .gte('completed_at', `${today}T00:00:00.000Z`)
        .lt('completed_at', `${today}T23:59:59.999Z`)
        .single();
      
      if (existingLog) {
        setNotification({
          type: 'xp',
          message: 'Habit already completed today!',
        });
        setTimeout(() => setNotification(null), 3000);
        return;
      }
      
      // Mark as complete in Supabase
      const { error } = await supabase
        .from('habit_logs')
        .insert({
          habit_id: habitId,
          user_id: profile.id,
          completed_at: new Date().toISOString(),
          xp_earned: 25, // Default XP
        });
      
      if (error) throw error;
      
      // Update user XP using RPC
      const { error: xpError } = await supabase
        .rpc('increment_user_xp', {
          user_profile_id: profile.id,
          xp_amount: 25
        });
      
      if (xpError) {
        console.log('XP function not available, skipping XP update:', xpError.message);
        // Note: XP increment function needs to be deployed in Supabase
      }
      
      // Update streak (simplified for now)
      if (habit) {
        const { error: updateError } = await supabase
          .from('habits')
          .update({
            streak: habit.streak + 1,
            best_streak: Math.max(habit.streak + 1, habit.best_streak),
            last_completed_date: new Date().toISOString().split('T')[0],
          })
          .eq('id', habitId);
        
        if (!updateError) {
          setHabits(habits.map(h => 
            h.id === habitId 
              ? { ...h, streak: h.streak + 1, best_streak: Math.max(h.streak + 1, h.best_streak) }
              : h
          ));
        }
      }
      
      setNotification({
        type: 'xp',
        message: `+25 XP earned! Habit completed for today!`,
      });
      
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error('Error completing habit:', error);
      setNotification({ type: 'xp', message: 'Failed to complete habit' });
    }
  };

  const handleCreateHabit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    const formData = new FormData(e.currentTarget);
    const habitValue = formData.get('habit') as string;
    const description = formData.get('description') as string;
    const difficulty = formData.get('difficulty') as 'easy' | 'medium' | 'hard';
    const frequency = formData.get('frequency') as 'daily' | 'weekly';

    // Find the selected habit from predefined list
    const selectedHabit = ALL_HABITS.find(h => h.value === habitValue);
    if (!selectedHabit) {
      setNotification({ type: 'xp', message: 'Please select a valid habit' });
      return;
    }

    try {
      // Get user profile ID
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('clerk_user_id', user.id)
        .single();
      
      if (!profile) {
        setNotification({ type: 'xp', message: 'Please complete your profile first' });
        return;
      }
      
      // Check if habit already exists for this user
      const { data: existingHabit } = await supabase
        .from('habits')
        .select('id')
        .eq('user_id', profile.id)
        .eq('title', selectedHabit.label)
        .eq('is_active', true)
        .single();
      
      if (existingHabit) {
        setNotification({ type: 'xp', message: 'You already have this habit!' });
        setTimeout(() => setNotification(null), 3000);
        return;
      }
      
      // Create habit in Supabase with predefined title
      const { data: newHabit, error } = await supabase
        .from('habits')
        .insert({
          user_id: profile.id,
          title: selectedHabit.label,
          description: description || selectedHabit.description,
          difficulty,
          frequency,
          streak: 0,
          best_streak: 0,
          is_active: true,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Reload habits to get the complete data
      await loadHabits();
      setShowNewHabitForm(false);
      setNotification({ type: 'xp', message: `✅ Habit "${selectedHabit.label}" created!` });
      setTimeout(() => setNotification(null), 3000);
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      console.error('Error creating habit:', error);
      setNotification({ type: 'xp', message: 'Failed to create habit' });
    }
  };

  if (!isLoaded || loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      
      {/* Notification Banner */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50"
          >
            <div className={`px-6 py-4 rounded-lg border backdrop-blur-sm shadow-lg flex items-center space-x-3 ${
              notification.type === 'levelup' ? 'bg-yellow-500/20 border-yellow-500' :
              notification.type === 'badge' ? 'bg-purple-500/20 border-purple-500' :
              notification.type === 'streak' ? 'bg-orange-500/20 border-orange-500' :
              'bg-green-500/20 border-green-500'
            }`}>
              {notification.type === 'levelup' && <Star className="text-yellow-400" size={24} />}
              {notification.type === 'badge' && <Trophy className="text-purple-400" size={24} />}
              {notification.type === 'streak' && <Flame className="text-orange-400" size={24} />}
              {notification.type === 'xp' && <Zap className="text-green-400" size={24} />}
              <span className="font-semibold">{notification.message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <main className="min-h-screen p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-2 glitch-text neon-glow" data-text="My Habits">
              My Habits
            </h1>
            <p className="text-gray-400">Track and manage your personal habits</p>
          </motion.div>

          {/* Create Habit Button */}
          <div className="mb-6">
            <button
              onClick={() => setShowNewHabitForm(!showNewHabitForm)}
              className="flex items-center space-x-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors neon-border"
            >
              <Plus size={20} />
              <span>Create New Habit</span>
            </button>
          </div>

          {/* New Habit Form */}
          {showNewHabitForm && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              onSubmit={handleCreateHabit}
              className="mb-8 p-6 rounded-lg border border-purple-500/30 bg-black/40 backdrop-blur-sm neon-border"
            >
              <h2 className="text-xl font-bold mb-4">Create New Habit</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Select Habit *</label>
                  <select
                    name="habit"
                    required
                    className="w-full px-4 py-3 bg-black/50 border border-purple-500/30 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
                  >
                    <option value="">-- Choose a habit --</option>
                    <optgroup label="Positive Habits">
                      {POSITIVE_HABITS.map((habit) => (
                        <option key={habit.value} value={habit.value}>
                          {habit.label}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Negative Habits to Break">
                      {NEGATIVE_HABITS.map((habit) => (
                        <option key={habit.value} value={habit.value}>
                          {habit.label}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Choose from our curated list of habits</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Custom Description (Optional)</label>
                  <textarea
                    name="description"
                    rows={3}
                    className="w-full px-4 py-3 bg-black/50 border border-purple-500/30 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
                    placeholder="Add your own notes or goals for this habit..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Difficulty *</label>
                  <select
                    name="difficulty"
                    required
                    className="w-full px-4 py-3 bg-black/50 border border-purple-500/30 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
                  >
                    <option value="easy">Easy - Small daily action (10 XP base)</option>
                    <option value="medium">Medium - Moderate effort (25 XP base)</option>
                    <option value="hard">Hard - Significant challenge (50 XP base)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Frequency *</label>
                  <select
                    name="frequency"
                    required
                    className="w-full px-4 py-3 bg-black/50 border border-purple-500/30 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
                
                <div className="flex space-x-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors font-semibold"
                  >
                    Create Habit
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNewHabitForm(false)}
                    className="flex-1 px-6 py-3 border border-purple-500/30 hover:bg-purple-500/10 rounded-lg transition-colors font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.form>
          )}

          {/* Habits Grid */}
          {habits.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 text-gray-400"
            >
              <Plus className="mx-auto mb-4" size={64} />
              <p className="text-xl mb-2">No habits yet</p>
              <p>Create your first habit to start building better routines!</p>
            </motion.div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {habits.map((habit, index) => (
                <motion.div
                  key={habit.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-6 rounded-lg border border-purple-500/30 bg-black/40 backdrop-blur-sm hover:border-purple-500/60 transition-all group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">

                      <h3 className="text-xl font-bold mb-1 group-hover:text-purple-400 transition-colors">
                        {habit.title}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className="inline-block px-2 py-1 bg-purple-600/20 rounded text-purple-400 text-xs">
                          {habit.frequency}
                        </span>
                        <span className={`inline-block px-2 py-1 rounded text-xs ${
                          habit.difficulty === 'easy' ? 'bg-green-600/20 text-green-400' :
                          habit.difficulty === 'medium' ? 'bg-yellow-600/20 text-yellow-400' :
                          'bg-red-600/20 text-red-400'
                        }`}>
                          {habit.difficulty}
                        </span>
                      </div>
                    </div>
                  </div>

                  {habit.description && (
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                      {habit.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <Flame size={20} className="text-orange-400" />
                      <div>
                        <p className="text-2xl font-bold">{habit.streak}</p>
                        <p className="text-xs text-gray-500">Current Streak</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-purple-400">{habit.best_streak}</p>
                      <p className="text-xs text-gray-500">Best</p>
                    </div>
                  </div>

                  {(() => {
                    const today = new Date().toISOString().split('T')[0];
                    const isCompletedToday = habit.last_completed_date === today;
                    
                    return (
                      <button
                        onClick={() => handleCompleteHabit(habit.id)}
                        disabled={isCompletedToday}
                        className={`w-full py-3 rounded-lg transition-colors flex items-center justify-center space-x-2 group/btn ${
                          isCompletedToday 
                            ? 'bg-green-600/50 text-green-200 cursor-not-allowed'
                            : 'bg-purple-600 hover:bg-purple-700 text-white'
                        }`}
                      >
                        <CheckCircle2 className={`group-hover/btn:transition-colors ${
                          isCompletedToday ? 'text-green-300' : 'text-purple-400 group-hover/btn:text-white'
                        }`} size={20} />
                        <span className="font-semibold">
                          {isCompletedToday ? 'Completed Today ✓' : 'Complete Today'}
                        </span>
                      </button>
                    );
                  })()}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
