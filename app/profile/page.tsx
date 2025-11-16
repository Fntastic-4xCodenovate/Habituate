// 'use client';

// import { useState, useEffect } from 'react';
// import { useUser, useClerk } from '@clerk/nextjs';
// import Navbar from '@/components/Navbar';
// import { motion } from 'framer-motion';
// import { useBackendUser } from '@/hooks/useBackendUser';
// import { profileAPI, badgesAPI, type UserBadge } from '@/lib/api';

// export default function ProfilePage() {
//   const { user } = useUser();
//   const { signOut } = useClerk();
//   const { backendUser, loading: backendLoading } = useBackendUser();
//   const [profileHovered, setProfileHovered] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [stats, setStats] = useState({
//     level: 1,
//     xp: 0,
//     xpIntoLevel: 0,
//     xpNeededForNext: 100,
//     xpRequiredForLevel: 100,
//     progressPercentage: 0,
//     streak: 0,
//     longestStreak: 0,
//     totalHabits: 0,
//     totalCompletions: 0,
//     clanXpContribution: 0,
//   });
//   const [badges, setBadges] = useState<UserBadge[]>([]);
//   const [clanName, setClanName] = useState<string | null>(null);

//   useEffect(() => {
//     if (backendUser?.id) {
//       loadUserData();
//     }
//   }, [backendUser?.id]);

//   const loadUserData = async () => {
//     try {
//       if (!backendUser?.id) return;
//       setLoading(true);

//       // Fetch all data in parallel
//       const [statsData, levelProgress, userBadges] = await Promise.all([
//         profileAPI.getStats(backendUser.id),
//         profileAPI.getLevelProgress(backendUser.id),
//         badgesAPI.getUserBadges(backendUser.id).catch(() => []),
//       ]);

//       setStats({
//         level: levelProgress.current_level,
//         xp: levelProgress.current_xp,
//         xpIntoLevel: levelProgress.xp_into_level,
//         xpNeededForNext: levelProgress.xp_needed_for_next,
//         xpRequiredForLevel: levelProgress.xp_required_for_level,
//         progressPercentage: levelProgress.progress_percentage,
//         streak: statsData.current_streak,
//         longestStreak: statsData.longest_streak,
//         totalHabits: statsData.total_habits,
//         totalCompletions: statsData.total_completions,
//         clanXpContribution: statsData.clan_xp_contribution,
//       });

//       setBadges(userBadges);

//       // TODO: Fetch clan name if user has clan_id
//       if (backendUser.clan_id) {
//         setClanName('CRIMSON NEXUS'); // Placeholder
//       }
//     } catch (error) {
//       console.error('Error loading user data:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const completionRate = stats.totalHabits > 0 
//     ? Math.round((stats.totalCompletions / stats.totalHabits) * 100) 
//     : 0;

//   if (loading || backendLoading) {
//     return (
//       <>
//         <Navbar />
//         <main className="min-h-screen w-full bg-gradient-to-b from-black via-purple-950/20 to-black pt-4">
//           <div className="flex flex-col items-center justify-center min-h-screen">
//             <div className="text-center space-y-4">
//               <div className="text-purple-400 text-xl font-mono animate-pulse">
//                 ▓▒░ LOADING PROFILE ░▒▓
//               </div>
//               <div className="flex justify-center gap-2">
//                 <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
//                 <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
//                 <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
//               </div>
//             </div>
//           </div>
//         </main>
//       </>
//     );
//   }

//   return (
//     <>
//       <Navbar />
//       <main className="min-h-screen w-full bg-gradient-to-b from-black via-purple-950/20 to-black pt-4">
//         <div className="flex flex-col items-center w-full">
          
//           {/* Fixed Profile Card at Top */}
//           <motion.div
//             initial={{ opacity: 0, y: -20 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="w-full flex justify-center pb-8"
//           >
//             <div className="w-full max-w-md px-4">
//               <div className="border-4 border-purple-500/50 rounded-lg bg-black/80 p-8 space-y-6 neon-glow">
//                 {/* Header with scan lines effect */}
//                 <div className="text-center space-y-1">
//                   <div className="text-xs font-mono text-purple-400 tracking-widest">
//                     ▓▒░ PLAYER PROFILE ░▒▓
//                   </div>
//                 </div>

//                 {/* Avatar Section */}
//                 <div
//                   className="flex justify-center"
//                   onMouseEnter={() => setProfileHovered(true)}
//                   onMouseLeave={() => setProfileHovered(false)}
//                 >
//                   <div className="w-32 h-32 rounded-full border-4 border-purple-500 overflow-hidden hover:scale-110 transition-transform">
//                     <img
//                       src={user?.imageUrl || '/avatars/default.png'}
//                       alt={user?.username || 'Profile'}
//                       className="w-full h-full object-cover"
//                     />
//                   </div>
//                 </div>

//                 {/* Username Section */}
//                 <div className="text-center space-y-2">
//                   <h1 className="text-3xl md:text-4xl font-bold text-purple-400 tracking-wider">
//                     {user?.username?.toUpperCase() || user?.firstName?.toUpperCase() || 'PLAYER'}
//                   </h1>
//                   <div className="text-xs md:text-sm font-mono text-gray-400 tracking-widest">
//                     {'[ PLAYER ID: 0x' + user?.id?.slice(0, 8) + ' ]'}
//                   </div>
//                 </div>

//                 {/* Clan Badge Section */}
//                 <div className="flex justify-center">
//                   {clanName ? (
//                     <div className="px-4 py-2 bg-purple-600/20 border-2 border-purple-500/50 rounded-lg">
//                       <span className="text-sm font-bold text-purple-400">🏰 {clanName}</span>
//                     </div>
//                   ) : (
//                     <div className="px-4 py-2 bg-gray-600/20 border-2 border-gray-500/50 rounded-lg">
//                       <span className="text-sm font-bold text-gray-400">👤 NO CLAN</span>
//                     </div>
//                   )}
//                 </div>

//                 {/* Badges Section */}
//                 <div className="space-y-3">
//                   <div className="text-xs font-mono text-gray-400 text-center tracking-widest">
//                     ≡ ACHIEVEMENTS ({badges.length}) ≡
//                   </div>
//                   {badges.length > 0 ? (
//                     <div className="grid grid-cols-2 gap-3">
//                       {badges.slice(0, 4).map((userBadge) => (
//                         <div key={userBadge.badge_id} className="px-4 py-3 bg-purple-600/20 border-2 border-purple-500/30 rounded-lg text-center">
//                           <div className="text-2xl mb-1">{userBadge.badge.icon}</div>
//                           <div className="text-xs font-bold text-purple-400">{userBadge.badge.name.toUpperCase()}</div>
//                         </div>
//                       ))}
//                     </div>
//                   ) : (
//                     <div className="px-4 py-3 bg-gray-600/20 border border-gray-500/30 rounded text-center">
//                       <div className="text-sm font-mono text-gray-400">No badges yet</div>
//                       <div className="text-xs text-gray-500 mt-1">Complete habits to earn badges!</div>
//                     </div>
//                   )}
//                 </div>

//                 {/* Stats Footer */}
//                 <div className="pt-4 border-t-4 border-purple-500 space-y-4">
//                   <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
//                     <div className="px-2 py-2 bg-purple-600/20 border border-purple-500/30 rounded">
//                       <div className="text-purple-400 font-bold text-lg">{stats.totalHabits}</div>
//                       <div className="text-gray-400 text-xs">HABITS</div>
//                     </div>
//                     <div className="px-2 py-2 bg-purple-600/20 border border-purple-500/30 rounded">
//                       <div className="text-purple-400 font-bold text-lg">{completionRate}%</div>
//                       <div className="text-gray-400 text-xs">COMPLETE</div>
//                     </div>
//                     <div className="px-2 py-2 bg-purple-600/20 border border-purple-500/30 rounded">
//                       <div className="text-purple-400 font-bold text-lg">{stats.level}</div>
//                       <div className="text-gray-400 text-xs">LEVEL</div>
//                     </div>
//                   </div>
                  
//                   {/* Logout Button */}
//                   <button
//                     onClick={() => signOut()}
//                     className="w-full py-3 bg-red-600/20 border-2 border-red-500/50 rounded-lg text-red-400 font-mono text-sm font-bold tracking-widest hover:bg-red-600/30 hover:border-red-500/80 transition-all duration-300"
//                   >
//                      LOGOUT SYSTEM 
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </motion.div>

//           {/* Scrollable Content Below */}
//           <div className="w-full max-w-md px-4 pb-12 space-y-4">
            
//             {/* Player Level Section */}
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.1 }}
//               className="border-4 border-purple-500/50 rounded-lg bg-black/80 p-6 space-y-4"
//             >
//               <div className="text-xs font-mono text-purple-400 tracking-widest">
//                 ▓▒░ LEVEL PROGRESS ░▒▓
//               </div>
//               <div className="space-y-2">
//                 <div className="flex justify-between items-center">
//                   <span className="text-sm font-mono text-white">LEVEL {stats.level}</span>
//                   <span className="text-sm font-mono text-gray-400">→ LEVEL {stats.level + 1}</span>
//                 </div>
//                 <div className="bg-black/60 border-2 border-purple-500/30 h-6 relative overflow-hidden rounded">
//                   <div
//                     className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center transition-all duration-500"
//                     style={{ width: `${stats.progressPercentage}%` }}
//                   >
//                     {stats.progressPercentage > 10 && (
//                       <span className="text-xs font-mono text-white font-bold">{Math.round(stats.progressPercentage)}%</span>
//                     )}
//                   </div>
//                 </div>
//                 <div className="flex justify-between text-xs font-mono text-gray-400">
//                   <span>{stats.xpIntoLevel.toLocaleString()} / {stats.xpRequiredForLevel.toLocaleString()} XP</span>
//                   <span>{stats.xpNeededForNext.toLocaleString()} needed</span>
//                 </div>
//               </div>
//             </motion.div>

//             {/* Streak Details Section */}
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.2 }}
//               className="border-4 border-purple-500/50 rounded-lg bg-black/80 p-6 space-y-4"
//             >
//               <div className="text-xs font-mono text-purple-400 tracking-widest">
//                 ▓▒░ STREAK STATUS ░▒▓
//               </div>
//               <div className="grid grid-cols-2 gap-3">
//                 <div className="px-4 py-3 bg-purple-600/20 border border-purple-500/30 rounded text-center">
//                   <div className="text-2xl font-bold text-orange-400">🔥</div>
//                   <div className="text-xl font-bold text-purple-400 mt-1">{stats.streak}</div>
//                   <div className="text-xs font-mono text-gray-400">DAY STREAK</div>
//                 </div>
//                 <div className="px-4 py-3 bg-purple-600/20 border border-purple-500/30 rounded text-center">
//                   <div className="text-2xl font-bold text-yellow-400">⭐</div>
//                   <div className="text-xl font-bold text-purple-400 mt-1">{stats.longestStreak}</div>
//                   <div className="text-xs font-mono text-gray-400">BEST STREAK</div>
//                 </div>
//               </div>
//             </motion.div>

//             {/* Statistics Section */}
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.3 }}
//               className="border-4 border-purple-500/50 rounded-lg bg-black/80 p-6 space-y-4"
//             >
//               <div className="text-xs font-mono text-purple-400 tracking-widest">
//                 ▓▒░ GAME STATISTICS ░▒▓
//               </div>
//               <div className="space-y-2">
//                 <div className="flex justify-between px-3 py-2 bg-purple-600/20 border border-purple-500/30 rounded">
//                   <span className="text-sm font-mono text-white">Total Habits</span>
//                   <span className="font-bold text-purple-400">{stats.totalHabits}</span>
//                 </div>
//                 <div className="flex justify-between px-3 py-2 bg-purple-600/20 border border-purple-500/30 rounded">
//                   <span className="text-sm font-mono text-white">Completions</span>
//                   <span className="font-bold text-purple-400">{stats.totalCompletions}</span>
//                 </div>
//                 <div className="flex justify-between px-3 py-2 bg-purple-600/20 border border-purple-500/30 rounded">
//                   <span className="text-sm font-mono text-white">Completion Rate</span>
//                   <span className="font-bold text-purple-400">{completionRate}%</span>
//                 </div>
//                 <div className="flex justify-between px-3 py-2 bg-purple-600/20 border border-purple-500/30 rounded">
//                   <span className="text-sm font-mono text-white">Total XP</span>
//                   <span className="font-bold text-purple-400">{stats.xp.toLocaleString()}</span>
//                 </div>
//                 {stats.clanXpContribution > 0 && (
//                   <div className="flex justify-between px-3 py-2 bg-purple-600/20 border border-purple-500/30 rounded">
//                     <span className="text-sm font-mono text-white">Clan Contribution</span>
//                     <span className="font-bold text-purple-400">{stats.clanXpContribution.toLocaleString()} XP</span>
//                   </div>
//                 )}
//               </div>
//             </motion.div>

//             {/* Bottom Status */}
//             <div className="text-center py-4 text-xs font-mono text-purple-400">
//               {'╔═════════════════════╗'}
//               <br />
//               {'║ SYSTEM ONLINE 100% ║'}
//               <br />
//               {'╚═════════════════════╝'}
//             </div>
//           </div>
//         </div>

//         {/* Ambient glow background */}
//         <style jsx>{`
//           @keyframes pulse-glow {
//             0%, 100% {
//               opacity: 0.3;
//             }
//             50% {
//               opacity: 0.6;
//             }
//           }

//           main {
//             position: relative;
//             overflow-x: hidden;
//           }

//           main::before {
//             content: '';
//             position: fixed;
//             top: 0;
//             left: 50%;
//             transform: translateX(-50%);
//             width: 600px;
//             height: 600px;
//             background: radial-gradient(
//               circle,
//               rgba(115, 79, 150, 0.15) 0%,
//               transparent 70%
//             );
//             pointer-events: none;
//             animation: pulse-glow 4s ease-in-out infinite;
//             z-index: 0;
//           }
//         `}</style>
//       </main>
//     </>
//   );
// }
'use client';

import { useState, useEffect } from 'react';
import { useUser, useClerk } from '@clerk/nextjs';
import Navbar from '@/components/Navbar';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';

export default function ProfilePage() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [profileHovered, setProfileHovered] = useState(false);
  const [stats, setStats] = useState({
    level: 1,
    xp: 0,
    maxXp: 100,
    streak: 0,
    totalBattles: 0,
    winRate: 0,
    badges: [] as any[],
  });
  const [clanInfo, setClanInfo] = useState<any>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    if (user?.id) {
      loadUserStats();
    }
  }, [user?.id]);

  const loadUserStats = async () => {
    try {
      if (!user?.id) return;

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('clerk_user_id', user.id)
        .single();

      if (profile) {
        setStats({
          level: profile.level || 1,
          xp: profile.xp || 0,
          maxXp: (profile.level || 1) * 100,
          streak: profile.current_streak || 0,
          totalBattles: profile.total_habits || 0,
          winRate: profile.completion_rate || 0,
          badges: [],
        });

        // Load clan information
        const { data: clanMember } = await supabase
          .from('clan_members')
          .select(`
            role,
            xp_contributed,
            joined_at,
            clans (
              id,
              name,
              level,
              total_xp
            )
          `)
          .eq('user_id', profile.id)
          .single();

        if (clanMember?.clans) {
          setClanInfo({
            clan_name: clanMember.clans.name,
            role: clanMember.role,
            xp_contributed: clanMember.xp_contributed,
            joined_at: clanMember.joined_at,
            clan_level: clanMember.clans.level,
            clan_total_xp: clanMember.clans.total_xp
          });
        }

        // Load recent habit completions for activity
        const { data: recentLogs } = await supabase
          .from('habit_logs')
          .select(`
            completed_at,
            xp_earned,
            habits (
              title
            )
          `)
          .eq('user_id', profile.id)
          .order('completed_at', { ascending: false })
          .limit(3);

        if (recentLogs) {
          setRecentActivity(recentLogs);
        }
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const xpProgress = (stats.xp / stats.maxXp) * 100;

  return (
    <>
      <Navbar />
      <main className="min-h-screen w-full bg-gradient-to-b from-black via-purple-950/20 to-black pt-4 text-white">
        <div className="flex flex-col items-center w-full">
          
          {/* Fixed Profile Card at Top */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full flex justify-center pb-8"
          >
            <div className="w-full max-w-md px-4">
              <div className="border-4 border-purple-500/50 rounded-lg bg-black/80 p-8 space-y-6 neon-glow">
                {/* Header with scan lines effect */}
                <div className="text-center space-y-1">
                  <div className="text-xs font-mono text-purple-400 tracking-widest">
                    ▓▒░ PLAYER PROFILE ░▒▓
                  </div>
                </div>

                {/* Avatar Section */}
                <div
                  className="flex justify-center"
                  onMouseEnter={() => setProfileHovered(true)}
                  onMouseLeave={() => setProfileHovered(false)}
                >
                  <div className="w-32 h-32 rounded-full border-4 border-purple-500 overflow-hidden hover:scale-110 transition-transform">
                    <img
                      src={user?.imageUrl || '/avatars/default.png'}
                      alt={user?.username || 'Profile'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Username Section */}
                <div className="text-center space-y-2">
                  <h1 className="text-3xl md:text-4xl font-bold text-purple-400 tracking-wider">
                    {user?.username?.toUpperCase() || user?.firstName?.toUpperCase() || 'PLAYER'}
                  </h1>
                  <div className="text-xs md:text-sm font-mono text-gray-400 tracking-widest">
                    {'[ PLAYER ID: 0x' + user?.id?.slice(0, 8) + ' ]'}
                  </div>
                </div>

                {/* Clan Badge Section */}
                <div className="flex justify-center">
                  <div className="px-4 py-2 bg-purple-600/20 border-2 border-purple-500/50 rounded-lg">
                    <span className="text-sm font-bold text-purple-400">
                      {clanInfo ? `🏰 ${clanInfo.clan_name.toUpperCase()}` : '🏠 NO CLAN'}
                    </span>
                  </div>
                </div>

                {/* Badges Section */}
                <div className="space-y-3">
                  <div className="text-xs font-mono text-gray-400 text-center tracking-widest">
                    ≡ ACHIEVEMENTS ≡
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="px-4 py-3 bg-purple-600/20 border-2 border-purple-500/30 rounded-lg text-center">
                      <div className="text-2xl mb-1">{stats.level >= 10 ? '⭐' : '🔒'}</div>
                      <div className="text-xs font-bold text-purple-400">VETERAN</div>
                    </div>
                    <div className="px-4 py-3 bg-purple-600/20 border-2 border-purple-500/30 rounded-lg text-center">
                      <div className="text-2xl mb-1">{stats.streak >= 7 ? '🔥' : '🔒'}</div>
                      <div className="text-xs font-bold text-purple-400">STREAKER</div>
                    </div>
                  </div>
                </div>

                {/* Stats Footer */}
                <div className="pt-4 border-t-4 border-purple-500 space-y-4">
                  <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
                    <div className="px-2 py-2 bg-purple-600/20 border border-purple-500/30 rounded">
                      <div className="text-purple-400 font-bold text-lg">{stats.totalBattles}</div>
                      <div className="text-gray-400 text-xs">HABITS</div>
                    </div>
                    <div className="px-2 py-2 bg-purple-600/20 border border-purple-500/30 rounded">
                      <div className="text-purple-400 font-bold text-lg">{Math.round(stats.winRate)}%</div>
                      <div className="text-gray-400 text-xs">WIN RATE</div>
                    </div>
                    <div className="px-2 py-2 bg-purple-600/20 border border-purple-500/30 rounded">
                      <div className="text-purple-400 font-bold text-lg">{stats.level}</div>
                      <div className="text-gray-400 text-xs">LEVEL</div>
                    </div>
                  </div>
                  
                  {/* Logout Button */}
                  <button
                    onClick={() => signOut()}
                    className="w-full py-3 bg-red-600/20 border-2 border-red-500/50 rounded-lg text-red-400 font-mono text-sm font-bold tracking-widest hover:bg-red-600/30 hover:border-red-500/80 transition-all duration-300"
                  >
                     LOGOUT 
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Scrollable Content Below */}
          <div className="w-full max-w-md px-4 pb-12 space-y-4">
            
            {/* Player Level Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="border-4 border-purple-500/50 rounded-lg bg-black/80 p-6 space-y-4"
            >
              <div className="text-xs font-mono text-purple-400 tracking-widest">
                ▓▒░ LEVEL PROGRESS ░▒▓
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-mono text-white">CURRENT LEVEL</span>
                  <span className="text-xl font-bold text-purple-400">{stats.level}</span>
                </div>
                <div className="bg-black/60 border-2 border-purple-500/30 h-6 relative overflow-hidden rounded">
                  <div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center transition-all duration-500"
                    style={{ width: `${xpProgress}%` }}
                  >
                    <span className="text-xs font-mono text-white font-bold">{Math.round(xpProgress)}%</span>
                  </div>
                </div>
                <div className="flex justify-between text-xs font-mono text-gray-400">
                  <span>{stats.xp} / {stats.maxXp} XP</span>
                </div>
              </div>
            </motion.div>

            {/* Recent Activity Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="border-4 border-purple-500/50 rounded-lg bg-black/80 p-6 space-y-4"
            >
              <div className="text-xs font-mono text-purple-400 tracking-widest">
                ▓▒░ RECENT ACTIVITY ░▒▓
              </div>
              <div className="space-y-3">
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity, index) => (
                    <div key={index} className="flex justify-between items-center px-3 py-2 bg-purple-600/20 border border-purple-500/30 rounded">
                      <span className="text-sm font-mono text-white">{activity.habits?.title || 'Habit Completed'}</span>
                      <span className="text-sm font-bold text-green-400">+ {activity.xp_earned} XP</span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-400 text-sm">
                    No recent activity
                  </div>
                )}
              </div>
            </motion.div>

            {/* Streak Details Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="border-4 border-purple-500/50 rounded-lg bg-black/80 p-6 space-y-4"
            >
              <div className="text-xs font-mono text-purple-400 tracking-widest">
                ▓▒░ STREAK STATUS ░▒▓
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="px-4 py-3 bg-purple-600/20 border border-purple-500/30 rounded text-center">
                  <div className="text-2xl font-bold text-orange-400">🔥</div>
                  <div className="text-xs font-mono text-gray-400 mt-1">{stats.streak} Day{stats.streak !== 1 ? 's' : ''}</div>
                  <div className="text-xs font-mono text-white font-bold">STREAK</div>
                </div>
                <div className="px-4 py-3 bg-purple-600/20 border border-purple-500/30 rounded text-center">
                  <div className="text-2xl font-bold text-yellow-400">⭐</div>
                  <div className="text-xs font-mono text-gray-400 mt-1">Level</div>
                  <div className="text-xs font-mono text-white font-bold">{stats.level}</div>
                </div>
              </div>
            </motion.div>

            {/* Clan Information Section */}
            {clanInfo && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="border-4 border-purple-500/50 rounded-lg bg-black/80 p-6 space-y-4"
              >
                <div className="text-xs font-mono text-purple-400 tracking-widest">
                  ▓▒░ CLAN STATUS ░▒▓
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between px-3 py-2 bg-purple-600/20 border border-purple-500/30 rounded">
                    <span className="text-sm font-mono text-white">Clan Name</span>
                    <span className="font-bold text-purple-400">{clanInfo.clan_name}</span>
                  </div>
                  <div className="flex justify-between px-3 py-2 bg-purple-600/20 border border-purple-500/30 rounded">
                    <span className="text-sm font-mono text-white">Your Role</span>
                    <span className={`font-bold ${clanInfo.role === 'Leader' ? 'text-yellow-400' : clanInfo.role === 'Moderator' ? 'text-blue-400' : 'text-gray-400'}`}>
                      {clanInfo.role}
                    </span>
                  </div>
                  <div className="flex justify-between px-3 py-2 bg-purple-600/20 border border-purple-500/30 rounded">
                    <span className="text-sm font-mono text-white">XP Contributed</span>
                    <span className="font-bold text-green-400">{clanInfo.xp_contributed}</span>
                  </div>
                  <div className="flex justify-between px-3 py-2 bg-purple-600/20 border border-purple-500/30 rounded">
                    <span className="text-sm font-mono text-white">Member Since</span>
                    <span className="font-bold text-gray-400">{new Date(clanInfo.joined_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Bottom Status */}
            <div className="text-center py-4 text-xs font-mono text-purple-400">
              {'╔═════════════════════╗'}
              <br />
              {'║ SYSTEM ONLINE 100% ║'}
              <br />
              {'╚═════════════════════╝'}
            </div>
          </div>
        </div>

        {/* Ambient glow background */}
        <style jsx>{`
          @keyframes pulse-glow {
            0%, 100% {
              opacity: 0.3;
            }
            50% {
              opacity: 0.6;
            }
          }

          main {
            position: relative;
            overflow-x: hidden;
          }

          main::before {
            content: '';
            position: fixed;
            top: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 600px;
            height: 600px;
            background: radial-gradient(
              circle,
              rgba(115, 79, 150, 0.15) 0%,
              transparent 70%
            );
            pointer-events: none;
            animation: pulse-glow 4s ease-in-out infinite;
            z-index: 0;
          }
        `}</style>
      </main>
    </>
  );
}