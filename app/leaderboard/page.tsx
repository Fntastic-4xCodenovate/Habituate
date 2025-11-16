'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Award, Users } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { leaderboardAPI } from '@/lib/api';

type LeaderboardCategory = 'users' | 'clans';

export default function LeaderboardPage() {
  const [userLeaderboard, setUserLeaderboard] = useState<any[]>([]);
  const [clanLeaderboard, setClanLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<LeaderboardCategory>('users');

  useEffect(() => {
    loadLeaderboard();
  }, [category]);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      const [users, clans] = await Promise.all([
        leaderboardAPI.getUsers(50),
        leaderboardAPI.getClans(50)
      ]);
      setUserLeaderboard(users);
      setClanLeaderboard(clans);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: 'users' as const, label: 'Top Users', icon: Trophy },
    { id: 'clans' as const, label: 'Top Clans', icon: Users },
  ];

  const currentLeaderboard = category === 'users' ? userLeaderboard : clanLeaderboard;

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
          {currentLeaderboard.length >= 3 && (
            <div className="flex justify-center items-end gap-4 mb-12">
              {[currentLeaderboard[1], currentLeaderboard[0], currentLeaderboard[2]].map((item, idx) => {
                const actualRank = idx === 0 ? 2 : idx === 1 ? 1 : 3;
                const heights = ['h-32', 'h-40', 'h-24'];
                const icons = [Medal, Trophy, Award];
                const Icon = icons[idx];
                const colors = ['text-gray-400', 'text-yellow-400', 'text-orange-400'];

                return item ? (
                  <motion.div
                    key={item.id}
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
                      <p className="font-semibold truncate">{category === 'users' ? item.username : item.name}</p>
                      <p className="text-sm text-gray-400">
                        {category === 'users' ? `Level ${item.level}` : `${item.member_count} members`}
                      </p>
                    </div>
                    <div className={`${heights[idx]} bg-gradient-to-t from-purple-600/40 to-purple-600/20 rounded-t-lg border-x border-t border-purple-500/50 flex items-center justify-center`}>
                      <p className="text-2xl font-bold">
                        {category === 'users' ? (item.xp || item.total_points) : item.total_xp}
                      </p>
                    </div>
                  </motion.div>
                ) : null;
              })}
            </div>
          )}

          {/* Rest of Leaderboard */}
          <div className="space-y-2">
            {currentLeaderboard.slice(3).map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                className="p-4 rounded-lg border border-purple-500/30 bg-black/40 backdrop-blur-sm hover:border-purple-500/60 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <span className="text-2xl font-bold text-gray-500 w-12">#{index + 4}</span>
                    <div className="w-12 h-12 rounded-full bg-purple-600/20 border border-purple-500/50 flex items-center justify-center">
                      {category === 'users' ? (
                        <span className="font-semibold">{item.username?.charAt(0).toUpperCase()}</span>
                      ) : (
                        <Users className="text-purple-400" size={20} />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{category === 'users' ? item.username : item.name}</p>
                      <p className="text-sm text-gray-400">
                        {category === 'users' 
                          ? `Level ${item.level}` 
                          : `${item.member_count} members • Level ${item.level}`
                        }
                      </p>
                      {category === 'clans' && item.description && (
                        <p className="text-xs text-gray-500 mt-1 truncate">{item.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-purple-400">
                      {(category === 'users' ? (item.xp || item.total_points) : item.total_xp)?.toLocaleString() || 0}
                    </p>
                    <p className="text-xs text-gray-500">
                      {category === 'users' ? 'XP' : 'Total XP'}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {currentLeaderboard.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <Trophy className="mx-auto mb-4" size={48} />
              <p className="text-lg">
                No {category === 'users' ? 'users' : 'clans'} on the leaderboard yet. Be the first!
              </p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
