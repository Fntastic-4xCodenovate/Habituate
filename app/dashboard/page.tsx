'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, CheckCircle2, Target, TrendingUp, Flame } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { supabase, getHabits, logHabitCompletion, createHabit, type Habit } from '@/lib/supabase';

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showNewHabitForm, setShowNewHabitForm] = useState(false);

  useEffect(() => {
    if (isLoaded && user) {
      loadHabits();
    }
  }, [isLoaded, user]);

  const loadHabits = async () => {
    try {
      if (!user) return;
      
      // Get user profile from Supabase first
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
        .eq('user_id', profile.id) // Use Supabase profile ID, not Clerk ID
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setHabits(data || []);
    } catch (error) {
      console.error('Error loading habits:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteHabit = async (habitId: string) => {
    try {
      if (!user || !userProfile) return;
      
      // Get the habit to check completion status
      const habit = habits.find(h => h.id === habitId);
      if (!habit) return;
      
      // Check if habit was already completed today
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      
      if (habit.last_completed_date === today) {
        alert('Habit already completed today! Come back tomorrow.');
        return;
      }
      
      // Double check in habit logs to prevent race conditions
      const { data: existingLog } = await supabase
        .from('habit_logs')
        .select('id')
        .eq('habit_id', habitId)
        .eq('user_id', userProfile.id)
        .gte('completed_at', `${today}T00:00:00.000Z`)
        .lt('completed_at', `${today}T23:59:59.999Z`)
        .single();
      
      if (existingLog) {
        alert('Habit already completed today!');
        return;
      }
      
      // Mark as complete in Supabase
      const { error } = await supabase
        .from('habit_logs')
        .insert({
          habit_id: habitId,
          user_id: userProfile.id,
          completed_at: new Date().toISOString(),
          xp_earned: 25,
        });
      
      if (error) throw error;
      
      // Update streak in habits table
      if (habit) {
        const newStreak = habit.streak + 1;
        const newBestStreak = Math.max(newStreak, habit.best_streak);
        
        await supabase
          .from('habits')
          .update({
            streak: newStreak,
            best_streak: newBestStreak,
            last_completed_date: new Date().toISOString().split('T')[0],
          })
          .eq('id', habitId);
      }
      
      // Reload data from database to show updated state
      await loadHabits();
    } catch (error) {
      console.error('Error completing habit:', error);
    }
  };

  const handleCreateHabit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || !userProfile) return;

    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const frequency = formData.get('frequency') as 'daily' | 'weekly';

    try {
      // Create habit in Supabase with correct user profile ID
      const { data: newHabit, error } = await supabase
        .from('habits')
        .insert({
          user_id: userProfile.id, // Use Supabase profile ID
          title,
          description,
          frequency,
          streak: 0,
          best_streak: 0,
          is_active: true,
        })
        .select()
        .single();
      
      if (error) throw error;
      setHabits([newHabit, ...habits]);
      setShowNewHabitForm(false);
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      console.error('Error creating habit:', error);
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

  const totalHabits = habits.length;
  const totalStreak = habits.reduce((sum, h) => sum + h.streak, 0);
  const bestStreak = Math.max(...habits.map(h => h.best_streak), 0);

  return (
    <>
      <Navbar />
      <main className="min-h-screen p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-2 glitch-text neon-glow" data-text="Dashboard">
              Dashboard
            </h1>
            <p className="text-gray-400">Welcome back, {user?.firstName || 'User'}!</p>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[
              { icon: Target, label: 'Total Habits', value: totalHabits, color: 'purple' },
              { icon: Flame, label: 'Current Streak', value: totalStreak, color: 'orange' },
              { icon: TrendingUp, label: 'Best Streak', value: bestStreak, color: 'green' },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-6 rounded-lg border border-purple-500/30 bg-black/40 backdrop-blur-sm neon-border"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                  </div>
                  <stat.icon className="text-purple-400" size={32} />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Habits Section */}
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-2xl font-bold neon-glow">Your Habits</h2>
            <button
              onClick={() => setShowNewHabitForm(!showNewHabitForm)}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors neon-border"
            >
              <Plus size={20} />
              <span>New Habit</span>
            </button>
          </div>

          {/* New Habit Form */}
          {showNewHabitForm && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              onSubmit={handleCreateHabit}
              className="mb-6 p-6 rounded-lg border border-purple-500/30 bg-black/40 backdrop-blur-sm"
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Habit Name</label>
                  <input
                    type="text"
                    name="title"
                    required
                    className="w-full px-4 py-2 bg-black/50 border border-purple-500/30 rounded-lg focus:border-purple-500 focus:outline-none"
                    placeholder="e.g., Morning Exercise"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    name="description"
                    rows={3}
                    className="w-full px-4 py-2 bg-black/50 border border-purple-500/30 rounded-lg focus:border-purple-500 focus:outline-none"
                    placeholder="What do you want to achieve?"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Frequency</label>
                  <select
                    name="frequency"
                    className="w-full px-4 py-2 bg-black/50 border border-purple-500/30 rounded-lg focus:border-purple-500 focus:outline-none"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
                <div className="flex space-x-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                  >
                    Create Habit
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNewHabitForm(false)}
                    className="flex-1 px-4 py-2 border border-purple-500/30 hover:bg-purple-500/10 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.form>
          )}

          {/* Habits List */}
          <div className="grid gap-4">
            {habits.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Target className="mx-auto mb-4" size={48} />
                <p className="text-lg">No habits yet. Create your first habit to get started!</p>
              </div>
            ) : (
              habits.map((habit, index) => (
                <motion.div
                  key={habit.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-6 rounded-lg border border-purple-500/30 bg-black/40 backdrop-blur-sm hover:border-purple-500/60 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-1">{habit.title}</h3>
                      <p className="text-gray-400 text-sm mb-2">{habit.description}</p>
                      <div className="flex items-center space-x-4 text-sm">
                        <span className="flex items-center space-x-1">
                          <Flame size={16} className="text-orange-400" />
                          <span>{habit.streak} day streak</span>
                        </span>
                        <span className="text-gray-500">Best: {habit.best_streak}</span>
                        <span className="px-2 py-1 bg-purple-600/20 rounded text-purple-400 text-xs">
                          {habit.frequency}
                        </span>
                      </div>
                    </div>
                    {(() => {
                      const today = new Date().toISOString().split('T')[0];
                      const isCompletedToday = habit.last_completed_date === today;
                      
                      return (
                        <button
                          onClick={() => handleCompleteHabit(habit.id)}
                          disabled={isCompletedToday}
                          className={`p-3 rounded-lg transition-colors group ${
                            isCompletedToday 
                              ? 'bg-green-600/50 cursor-not-allowed'
                              : 'bg-purple-600/20 hover:bg-purple-600'
                          }`}
                        >
                          <CheckCircle2 className={`transition-colors ${
                            isCompletedToday 
                              ? 'text-green-300' 
                              : 'text-purple-400 group-hover:text-white'
                          }`} size={24} />
                        </button>
                      );
                    })()}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </main>
    </>
  );
}
