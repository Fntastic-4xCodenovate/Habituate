'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Award, Globe, MapPin, Users } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { getLeaderboard, type UserProfile } from '@/lib/supabase';

type LeaderboardCategory = 'global'  |  'clan';

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<LeaderboardCategory>('global');

  useEffect(() => {
    loadLeaderboard();
  }, [category]);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      const data = await getLeaderboard(50);
      // TODO: Filter by category when backend supports it
      setLeaderboard(data);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: 'global' as const, label: 'Global', icon: Globe },
    { id: 'clan' as const, label: 'Clan', icon: Users },
  ];

  if (loading) {
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
      <main className="min-h-screen p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-2 glitch-text neon-glow" data-text="Leaderboard">
              Leaderboard
            </h1>
            <p className="text-gray-400">See how you rank against other users</p>
          </motion.div>

          {/* Category Tabs */}
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all whitespace-nowrap ${
                    category === cat.id
                      ? 'bg-purple-600 border-purple-500 text-white'
                      : 'bg-black/40 border-purple-500/30 text-gray-400 hover:border-purple-500/60 hover:text-white'
                  }`}
                >
                  <Icon size={18} />
                  <span className="font-semibold">{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Top 3 Podium */}
          {leaderboard.length >= 3 && (
            <div className="flex justify-center items-end gap-4 mb-12">
              {[leaderboard[1], leaderboard[0], leaderboard[2]].map((user, idx) => {
                const actualRank = idx === 0 ? 2 : idx === 1 ? 1 : 3;
                const heights = ['h-32', 'h-40', 'h-24'];
                const icons = [Medal, Trophy, Award];
                const Icon = icons[idx];
                const colors = ['text-gray-400', 'text-yellow-400', 'text-orange-400'];

                return user ? (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`flex-1 max-w-[140px]`}
                  >
                    <div className="text-center mb-2">
                      <Icon className={`mx-auto mb-2 ${colors[idx]}`} size={32} />
                      <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-purple-600/20 border-2 border-purple-500/50 flex items-center justify-center">
                        <span className="text-2xl font-bold">#{actualRank}</span>
                      </div>
                      <p className="font-semibold truncate">{user.username}</p>
                      <p className="text-sm text-gray-400">Level {user.level}</p>
                    </div>
                    <div className={`${heights[idx]} bg-gradient-to-t from-purple-600/40 to-purple-600/20 rounded-t-lg border-x border-t border-purple-500/50 flex items-center justify-center`}>
                      <p className="text-2xl font-bold">{user.total_points}</p>
                    </div>
                  </motion.div>
                ) : null;
              })}
            </div>
          )}

          {/* Rest of Leaderboard */}
          <div className="space-y-2">
            {leaderboard.slice(3).map((user, index) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                className="p-4 rounded-lg border border-purple-500/30 bg-black/40 backdrop-blur-sm hover:border-purple-500/60 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <span className="text-2xl font-bold text-gray-500 w-12">#{index + 4}</span>
                    <div className="w-12 h-12 rounded-full bg-purple-600/20 border border-purple-500/50 flex items-center justify-center">
                      <span className="font-semibold">{user.username.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{user.username}</p>
                      <p className="text-sm text-gray-400">Level {user.level}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-purple-400">{user.total_points}</p>
                    <p className="text-xs text-gray-500">points</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {leaderboard.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <Trophy className="mx-auto mb-4" size={48} />
              <p className="text-lg">No users on the leaderboard yet. Be the first!</p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
