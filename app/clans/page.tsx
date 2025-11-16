'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '@clerk/nextjs';
import Navbar from '@/components/Navbar';
import { supabase } from '@/lib/supabase';
import { 
  Users, 
  Plus, 
  Search, 
  Crown, 
  LogOut,
  Settings,
  Copy,
  Check,
  UserPlus,
  Shield
} from 'lucide-react';

interface Clan {
  id: string;
  name: string;
  description: string;
  member_count: number;
  max_members: number;
  level: number;
  total_xp: number;
  tags: string[];
  join_code: string;
  is_public: boolean;
}

export default function ClanBrowserPage() {
  const { user } = useUser();
  const [publicClans, setPublicClans] = useState<Clan[]>([]);
  const [userClan, setUserClan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [joinCode, setJoinCode] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  
  // Create clan form
  const [clanName, setClanName] = useState('');
  const [clanDescription, setClanDescription] = useState('');
  const [maxMembers, setMaxMembers] = useState(50);
  const [isPublic, setIsPublic] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadData();
    }
  }, [user?.id]);

  const loadData = async () => {
    try {
      await Promise.all([loadPublicClans(), loadUserClan()]);
    } finally {
      setLoading(false);
    }
  };

  const loadPublicClans = async () => {
    const { data, error } = await supabase
      .from('clans')
      .select('*')
      .eq('is_public', true)
      .order('level', { ascending: false });
    
    if (data) {
      setPublicClans(data);
    }
  };

  const loadUserClan = async () => {
    if (!user?.id) return;
    
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('clerk_user_id', user.id)
      .single();
    
    if (!profile) return;
    
    const { data: membership } = await supabase
      .from('clan_members')
      .select(`
        role,
        xp_contributed,
        joined_at,
        clans (*)
      `)
      .eq('user_id', profile.id)
      .single();
    
    if (membership?.clans) {
      setUserClan({ ...membership.clans, user_role: membership.role });
    }
  };

  const handleJoinClan = async (clanId?: string, code?: string) => {
    if (!user?.id) return;
    
    try {
      const joinCodeToUse = code || joinCode;
      if (!joinCodeToUse) {
        setNotification({ type: 'error', message: 'Please enter a clan code' });
        return;
      }

      const { data, error } = await supabase.rpc('join_clan_by_code', {
        p_join_code: joinCodeToUse.toUpperCase(),
        p_user_clerk_id: user.id
      });

      if (data?.success) {
        setNotification({ type: 'success', message: data.message });
        setJoinCode('');
        await loadData();
      } else {
        setNotification({ type: 'error', message: data?.message || 'Failed to join clan' });
      }
    } catch (error) {
      console.error('Error joining clan:', error);
      setNotification({ type: 'error', message: 'Failed to join clan' });
    }
  };

  const handleLeaveClan = async () => {
    if (!user?.id || !confirm('Are you sure you want to leave this clan?')) return;
    
    try {
      const { data, error } = await supabase.rpc('leave_clan', {
        p_user_clerk_id: user.id
      });

      if (data?.success) {
        setNotification({ type: 'success', message: data.message });
        await loadData();
      } else {
        setNotification({ type: 'error', message: data?.message || 'Failed to leave clan' });
      }
    } catch (error) {
      console.error('Error leaving clan:', error);
      setNotification({ type: 'error', message: 'Failed to leave clan' });
    }
  };

  const handleCreateClan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase.rpc('create_clan', {
        p_name: clanName,
        p_description: clanDescription,
        p_max_members: maxMembers,
        p_is_public: isPublic,
        p_user_clerk_id: user.id
      });

      if (data?.success) {
        setNotification({ type: 'success', message: data.message });
        setShowCreateForm(false);
        setClanName('');
        setClanDescription('');
        setMaxMembers(50);
        setIsPublic(true);
        await loadData();
      } else {
        setNotification({ type: 'error', message: data?.message || 'Failed to create clan' });
      }
    } catch (error) {
      console.error('Error creating clan:', error);
      setNotification({ type: 'error', message: 'Failed to create clan' });
    }
  };

  const copyJoinCode = async (code: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

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
      
      {/* Notification */}
      {notification && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50"
        >
          <div className={`px-6 py-4 rounded-lg border backdrop-blur-sm shadow-lg ${
            notification.type === 'success' ? 'bg-green-500/20 border-green-500' : 'bg-red-500/20 border-red-500'
          }`}>
            <span className="font-semibold">{notification.message}</span>
          </div>
        </motion.div>
      )}

      <main className="min-h-screen p-4 md:p-8 pt-20">
        <div className="max-w-6xl mx-auto">
          
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-2 glitch-text neon-glow" data-text="Clan Management">
              Clan Management
            </h1>
            <p className="text-gray-400">Join a community, create your own clan, or manage your current one</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Current Clan Status */}
            <div className="lg:col-span-2">
              
              {userClan ? (
                /* Current Clan Card */
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-900/50 border border-purple-500/30 rounded-lg p-6 mb-6"
                >
                  <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <Users className="text-purple-400" />
                    Your Clan: {userClan.name}
                    {userClan.user_role === 'Leader' && <Crown className="text-yellow-400" size={20} />}
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-gray-400 mb-2">{userClan.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-300">
                        <span>Level {userClan.level}</span>
                        <span>•</span>
                        <span>{userClan.member_count}/{userClan.max_members} members</span>
                        <span>•</span>
                        <span className={`font-bold ${userClan.user_role === 'Leader' ? 'text-yellow-400' : userClan.user_role === 'Moderator' ? 'text-blue-400' : 'text-gray-400'}`}>
                          {userClan.user_role}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-400">Join Code:</span>
                      <code className="bg-black/40 px-2 py-1 rounded text-purple-400 font-mono">
                        {userClan.join_code}
                      </code>
                      <button
                        onClick={() => copyJoinCode(userClan.join_code)}
                        className="p-1 hover:bg-gray-700 rounded transition-colors"
                      >
                        {copiedCode === userClan.join_code ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => window.location.href = '/clan'}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                    >
                      <Settings size={18} />
                      Manage Clan
                    </button>
                    <button
                      onClick={handleLeaveClan}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                    >
                      <LogOut size={18} />
                      Leave Clan
                    </button>
                  </div>
                </motion.div>
              ) : (
                /* Join/Create Clan Options */
                <div className="space-y-6">
                  
                  {/* Join by Code */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-900/50 border border-purple-500/30 rounded-lg p-6"
                  >
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                      <UserPlus className="text-green-400" />
                      Join a Clan
                    </h2>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={joinCode}
                        onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                        placeholder="Enter clan code (e.g., SHADOW)"
                        className="flex-1 px-4 py-2 bg-black/40 border border-purple-500/30 rounded-lg focus:outline-none focus:border-purple-500 text-white"
                        maxLength={8}
                      />
                      <button
                        onClick={() => handleJoinClan()}
                        className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                        disabled={!joinCode.trim()}
                      >
                        Join
                      </button>
                    </div>
                  </motion.div>

                  {/* Create Clan */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gray-900/50 border border-purple-500/30 rounded-lg p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Plus className="text-blue-400" />
                        Create Your Own Clan
                      </h2>
                      <button
                        onClick={() => setShowCreateForm(!showCreateForm)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                      >
                        {showCreateForm ? 'Cancel' : 'Create Clan'}
                      </button>
                    </div>
                    
                    {showCreateForm && (
                      <form onSubmit={handleCreateClan} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Clan Name *</label>
                          <input
                            type="text"
                            value={clanName}
                            onChange={(e) => setClanName(e.target.value)}
                            required
                            className="w-full px-4 py-2 bg-black/40 border border-purple-500/30 rounded-lg focus:outline-none focus:border-purple-500 text-white"
                            placeholder="Enter your clan name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Description *</label>
                          <textarea
                            value={clanDescription}
                            onChange={(e) => setClanDescription(e.target.value)}
                            required
                            rows={3}
                            className="w-full px-4 py-2 bg-black/40 border border-purple-500/30 rounded-lg focus:outline-none focus:border-purple-500 text-white"
                            placeholder="Describe your clan's mission and goals"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Max Members</label>
                            <input
                              type="number"
                              value={maxMembers}
                              onChange={(e) => setMaxMembers(parseInt(e.target.value) || 50)}
                              min="5"
                              max="100"
                              className="w-full px-4 py-2 bg-black/40 border border-purple-500/30 rounded-lg focus:outline-none focus:border-purple-500 text-white"
                            />
                          </div>
                          <div>
                            <label className="flex items-center gap-2 mt-8">
                              <input
                                type="checkbox"
                                checked={isPublic}
                                onChange={(e) => setIsPublic(e.target.checked)}
                                className="w-4 h-4"
                              />
                              <span className="text-sm">Public clan (visible to all)</span>
                            </label>
                          </div>
                        </div>
                        <button
                          type="submit"
                          className="w-full py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-colors"
                          disabled={!clanName.trim() || !clanDescription.trim()}
                        >
                          Create Clan
                        </button>
                      </form>
                    )}
                  </motion.div>
                </div>
              )}

              {/* Public Clans */}
              {!userClan && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-gray-900/50 border border-purple-500/30 rounded-lg p-6"
                >
                  <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <Search className="text-yellow-400" />
                    Discover Public Clans
                  </h2>
                  <div className="grid gap-4">
                    {publicClans.map((clan) => (
                      <div key={clan.id} className="bg-black/40 rounded-lg p-4 border border-purple-500/20">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-purple-400">{clan.name}</h3>
                            <p className="text-gray-400 text-sm mb-2">{clan.description}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span>Level {clan.level}</span>
                              <span>•</span>
                              <span>{clan.member_count}/{clan.max_members} members</span>
                              <span>•</span>
                              <span>{clan.total_xp.toLocaleString()} XP</span>
                            </div>
                            {clan.tags && clan.tags.length > 0 && (
                              <div className="flex gap-1 mt-2">
                                {clan.tags.map((tag, idx) => (
                                  <span key={idx} className="px-2 py-1 bg-purple-600/20 text-purple-300 text-xs rounded">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <code className="text-xs bg-black/60 px-2 py-1 rounded text-purple-400 font-mono">
                              {clan.join_code}
                            </code>
                            <button
                              onClick={() => handleJoinClan(clan.id, clan.join_code)}
                              className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm transition-colors"
                              disabled={clan.member_count >= clan.max_members}
                            >
                              {clan.member_count >= clan.max_members ? 'Full' : 'Join'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="bg-gray-900/50 border border-purple-500/30 rounded-lg p-4">
                <h3 className="font-bold mb-3">Clan Stats</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Public Clans</span>
                    <span className="font-bold text-purple-400">{publicClans.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Your Status</span>
                    <span className="font-bold text-green-400">
                      {userClan ? 'In Clan' : 'Free Agent'}
                    </span>
                  </div>
                  {userClan && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Your Role</span>
                        <span className={`font-bold ${userClan.user_role === 'Leader' ? 'text-yellow-400' : userClan.user_role === 'Moderator' ? 'text-blue-400' : 'text-gray-400'}`}>
                          {userClan.user_role}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Clan Level</span>
                        <span className="font-bold text-purple-400">{userClan.level}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Help */}
              <div className="bg-gray-900/50 border border-purple-500/30 rounded-lg p-4">
                <h3 className="font-bold mb-3">Need Help?</h3>
                <div className="space-y-2 text-sm text-gray-400">
                  <p>• Join a clan using their unique code</p>
                  <p>• Create your own clan and invite others</p>
                  <p>• Only leaders can transfer leadership</p>
                  <p>• You can only be in one clan at a time</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}