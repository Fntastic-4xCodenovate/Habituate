'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import ClanChat from '@/components/ClanChat';
import { supabase } from '@/lib/supabase';
import { 
  Users, 
  MessageSquare, 
  Target, 
  Crown, 
  Settings, 
  Upload,
  Palette,
  FileText,
  Shield,
  UserPlus,
  TrendingUp,
  Award,
  Send,
  X,
  Check,
  Edit,
  ChevronDown
} from 'lucide-react';

interface ClanMember {
  id: string;
  user_id: string;
  clan_id: string;
  role: 'Leader' | 'Moderator' | 'Member';
  xp_contributed: number;
  joined_at: string;
  user_profiles: {
    clerk_user_id: string;
    username: string;
    level: number;
    xp: number;
    current_streak: number;
  };
}

interface Clan {
  id: string;
  name: string;
  description: string;
  avatar_url: string;
  total_xp: number;
  level: number;
  max_members: number;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export default function ClanPage() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState('overview');
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(true);
  const [clan, setClan] = useState<Clan | null>(null);
  const [members, setMembers] = useState<ClanMember[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userMembership, setUserMembership] = useState<ClanMember | null>(null);
  const [pendingMembers, setPendingMembers] = useState<any[]>([]);
  
  // Settings states
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editMaxMembers, setEditMaxMembers] = useState(50);
  const [editIsPublic, setEditIsPublic] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadClanData();
    }
  }, [user?.id]);

  const loadClanData = async () => {
    try {
      if (!user?.id) return;
      
      // Get user profile
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('clerk_user_id', user.id)
        .single();
      
      if (!profile) return;
      setUserProfile(profile);
      
      // Get user's clan membership
      const { data: membership } = await supabase
        .from('clan_members')
        .select(`
          *,
          clans (*)
        `)
        .eq('user_id', profile.id)
        .single();
      
      if (!membership?.clans) {
        setLoading(false);
        return;
      }
      
      setUserMembership(membership);
      setClan(membership.clans);
      setEditName(membership.clans.name);
      setEditDescription(membership.clans.description || '');
      setEditMaxMembers(membership.clans.max_members);
      setEditIsPublic(membership.clans.is_public);
      
      // Load all clan members with their profiles
      const { data: clanMembers } = await supabase
        .from('clan_members')
        .select(`
          *,
          user_profiles (
            clerk_user_id,
            username,
            level,
            xp,
            current_streak
          )
        `)
        .eq('clan_id', membership.clans.id)
        .order('xp_contributed', { ascending: false });
      
      if (clanMembers) {
        setMembers(clanMembers);
      }
      
    } catch (error) {
      console.error('Error loading clan data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTransferLeadership = async (memberId: string) => {
    if (!clan || !userMembership || userMembership.role !== 'Leader') return;
    
    try {
      // Update current leader to member
      await supabase
        .from('clan_members')
        .update({ role: 'Member' })
        .eq('id', userMembership.id);
      
      // Update new leader
      await supabase
        .from('clan_members')
        .update({ role: 'Leader' })
        .eq('id', memberId);
      
      // Reload data
      await loadClanData();
    } catch (error) {
      console.error('Error transferring leadership:', error);
    }
  };

  const handlePromoteMember = async (memberId: string, newRole: 'Moderator' | 'Member') => {
    if (!userMembership || userMembership.role !== 'Leader') return;
    
    try {
      await supabase
        .from('clan_members')
        .update({ role: newRole })
        .eq('id', memberId);
      
      await loadClanData();
    } catch (error) {
      console.error('Error updating member role:', error);
    }
  };

  const handleKickMember = async (memberId: string) => {
    if (!userMembership || userMembership.role !== 'Leader') return;
    
    try {
      await supabase
        .from('clan_members')
        .delete()
        .eq('id', memberId);
      
      await loadClanData();
    } catch (error) {
      console.error('Error kicking member:', error);
    }
  };

  const handleSaveSettings = async () => {
    if (!clan || !userMembership || userMembership.role !== 'Leader') return;
    
    try {
      await supabase
        .from('clans')
        .update({
          name: editName,
          description: editDescription,
          max_members: editMaxMembers,
          is_public: editIsPublic
        })
        .eq('id', clan.id);
      
      await loadClanData();
      setShowSettings(false);
    } catch (error) {
      console.error('Error updating clan settings:', error);
    }
  };

  const isLeader = userMembership?.role === 'Leader';
  const isModerator = userMembership?.role === 'Moderator';
  const canManage = isLeader || isModerator;

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

  if (!clan) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center p-8 bg-gray-900/50 border border-purple-500/30 rounded-lg max-w-md">
            <Users className="text-gray-400 mx-auto mb-4" size={64} />
            <h1 className="text-2xl font-bold mb-2">You're not in a clan yet</h1>
            <p className="text-gray-400 mb-6">Join a clan to start building community and earning rewards together!</p>
            <Link 
              href="/clans"
              className="inline-flex items-center space-x-2 py-3 px-6 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors font-semibold"
            >
              <UserPlus size={20} />
              <span>Find a Clan</span>
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-20 px-4 pb-12">
        <div className="max-w-7xl mx-auto">
          {/* Clan Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative mb-8 rounded-lg overflow-hidden"
          >
            {/* Banner */}
            <div className="h-48 bg-gradient-to-r from-purple-900 to-blue-900 relative">
              <div className="absolute inset-0 bg-black/40" />
              <div className="absolute bottom-4 left-4 flex items-end gap-4">
                {/* Clan Image */}
                <div className="w-24 h-24 rounded-lg border-4 border-white bg-purple-600 flex items-center justify-center text-4xl font-bold">
                  {clan.avatar_url ? (
                    <img src={clan.avatar_url} alt={clan.name} className="w-full h-full rounded-lg object-cover" />
                  ) : (
                    clan.name[0]?.toUpperCase()
                  )}
                </div>
                <div className="mb-2">
                  <h1 className="text-4xl font-bold text-white flex items-center gap-2">
                    {clan.name}
                    {isLeader && <Crown className="text-yellow-400" size={32} />}
                  </h1>
                  <p className="text-gray-300 italic">&ldquo;{clan.description || 'Building better habits together'}&rdquo;</p>
                </div>
              </div>
              {isLeader && (
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                >
                  <Settings className="text-white" size={24} />
                </button>
              )}
            </div>

            {/* Clan Stats */}
            <div className="bg-black/60 backdrop-blur-sm border-t border-purple-500/30 p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">Level {clan.level}</div>
                  <div className="text-sm text-gray-400">Clan Level</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">{members.length}/{clan.max_members}</div>
                  <div className="text-sm text-gray-400">Members</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">{clan.total_xp.toLocaleString()}</div>
                  <div className="text-sm text-gray-400">Total XP</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">{clan.is_public ? 'Public' : 'Private'}</div>
                  <div className="text-sm text-gray-400">Type</div>
                </div>
              </div>
              {/* XP Progress Bar */}
              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-400 mb-1">
                  <span>Progress to Level {clan.level + 1}</span>
                  <span>{clan.total_xp}/{(clan.level + 1) * 10000} XP</span>
                </div>
                <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500"
                    style={{ width: `${(clan.total_xp / ((clan.level + 1) * 10000)) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: Target },
              { id: 'members', label: 'Members', icon: Users },
              { id: 'chat', label: 'Chat', icon: MessageSquare },
              ...(canManage ? [{ id: 'manage', label: 'Manage', icon: Shield }] : [])
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {activeTab === 'overview' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  {/* Clan Description */}
                  <div className="bg-gray-900/50 border border-purple-500/30 rounded-lg p-6">
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                      <Shield className="text-purple-400" />
                      About This Clan
                    </h2>
                    <p className="text-gray-300">
                      {clan.description || 'A dedicated group of individuals working together to build better habits and achieve personal growth.'}
                    </p>
                    <div className="mt-4 flex items-center gap-4 text-sm text-gray-400">
                      <span>Created: {new Date(clan.created_at).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{clan.is_public ? 'Public Clan' : 'Private Clan'}</span>
                    </div>
                  </div>

                  {/* Top Contributors */}
                  <div className="bg-gray-900/50 border border-purple-500/30 rounded-lg p-6">
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                      <TrendingUp className="text-green-400" />
                      Top Contributors
                    </h2>
                    <div className="space-y-3">
                      {members.slice(0, 5).map((member, index) => (
                        <div key={member.id} className="flex items-center gap-3 p-3 bg-black/40 rounded-lg">
                          <div className={`text-2xl font-bold ${index === 0 ? 'text-yellow-400' : index === 1 ? 'text-gray-400' : index === 2 ? 'text-orange-600' : 'text-gray-500'}`}>
                            #{index + 1}
                          </div>
                          <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold">
                            {member.user_profiles?.username?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold flex items-center gap-1">
                              {member.user_profiles?.username || 'Unknown User'}
                              {member.role === 'Leader' && <Crown className="text-yellow-400" size={14} />}
                            </div>
                            <div className="text-sm text-gray-400">Level {member.user_profiles?.level || 1}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-purple-400">{member.xp_contributed} XP</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'members' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-gray-900/50 border border-purple-500/30 rounded-lg p-6"
                >
                  <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <Users className="text-blue-400" />
                    Clan Members ({members.length}/{clan.max_members})
                  </h2>
                  <div className="space-y-3">
                    {members.map(member => (
                      <div key={member.id} className="flex items-center gap-3 p-4 bg-black/40 rounded-lg hover:bg-black/60 transition-colors">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-lg">
                            {member.user_profiles?.username?.[0]?.toUpperCase() || 'U'}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-lg">{member.user_profiles?.username || 'Unknown User'}</span>
                            {member.role === 'Leader' && <Crown className="text-yellow-400" size={16} />}
                            {member.role === 'Moderator' && <Shield className="text-blue-400" size={16} />}
                          </div>
                          <div className="text-sm text-gray-400">{member.role} • Level {member.user_profiles?.level || 1}</div>
                          <div className="text-xs text-gray-500">Contributed: {member.xp_contributed} XP</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <div className="font-bold text-purple-400">{member.user_profiles?.xp || 0} XP</div>
                            <div className="text-xs text-gray-500">Streak: {member.user_profiles?.current_streak || 0}</div>
                          </div>
                          {isLeader && member.role !== 'Leader' && (
                            <div className="relative group">
                              <button className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
                                <ChevronDown size={16} />
                              </button>
                              <div className="absolute right-0 top-full mt-1 bg-gray-800 border border-purple-500/30 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 min-w-[120px]">
                                <button
                                  onClick={() => handlePromoteMember(member.id, member.role === 'Moderator' ? 'Member' : 'Moderator')}
                                  className="w-full px-3 py-2 text-left hover:bg-gray-700 first:rounded-t-lg"
                                >
                                  {member.role === 'Moderator' ? 'Demote' : 'Promote'}
                                </button>
                                <button
                                  onClick={() => handleTransferLeadership(member.id)}
                                  className="w-full px-3 py-2 text-left hover:bg-gray-700 text-yellow-400"
                                >
                                  Transfer Leadership
                                </button>
                                <button
                                  onClick={() => handleKickMember(member.id)}
                                  className="w-full px-3 py-2 text-left hover:bg-gray-700 text-red-400 rounded-b-lg"
                                >
                                  Kick Member
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'chat' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-gray-900/50 border border-purple-500/30 rounded-lg p-6 h-[600px]"
                >
                  <ClanChat
                    clanId={clan.id}
                    userId={user?.id || 'guest'}
                    userName={user?.fullName || user?.username || 'Guest'}
                  />
                </motion.div>
              )}

              {activeTab === 'manage' && canManage && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  {/* Clan Settings - Only for Leaders */}
                  {isLeader && (
                    <div className="bg-gray-900/50 border border-purple-500/30 rounded-lg p-6">
                      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                        <Settings className="text-blue-400" />
                        Clan Settings
                      </h2>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold mb-2">Clan Name</label>
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full px-4 py-2 bg-black/40 border border-purple-500/30 rounded-lg focus:outline-none focus:border-purple-500 text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-2">Clan Description</label>
                          <textarea
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            rows={3}
                            className="w-full px-4 py-2 bg-black/40 border border-purple-500/30 rounded-lg focus:outline-none focus:border-purple-500 text-white"
                            placeholder="Describe your clan's mission and goals..."
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-2">Max Members</label>
                          <input
                            type="number"
                            min="1"
                            max="100"
                            value={editMaxMembers}
                            onChange={(e) => setEditMaxMembers(parseInt(e.target.value) || 50)}
                            className="w-full px-4 py-2 bg-black/40 border border-purple-500/30 rounded-lg focus:outline-none focus:border-purple-500 text-white"
                          />
                        </div>
                        <div>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={editIsPublic}
                              onChange={(e) => setEditIsPublic(e.target.checked)}
                              className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500"
                            />
                            <span className="text-sm font-semibold">Public Clan (anyone can join)</span>
                          </label>
                        </div>
                        <button
                          onClick={handleSaveSettings}
                          className="w-full py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition-colors"
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Member Management */}
                  <div className="bg-gray-900/50 border border-purple-500/30 rounded-lg p-6">
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                      <Users className="text-blue-400" />
                      Member Management
                    </h2>
                    <div className="space-y-3">
                      {members.map(member => (
                        <div key={member.id} className="flex items-center gap-3 p-3 bg-black/40 rounded-lg">
                          <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold">
                            {member.user_profiles?.username?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold flex items-center gap-2">
                              {member.user_profiles?.username || 'Unknown User'}
                              {member.role === 'Leader' && <Crown className="text-yellow-400" size={16} />}
                              {member.role === 'Moderator' && <Shield className="text-blue-400" size={16} />}
                            </div>
                            <div className="text-sm text-gray-400">{member.role} • Joined: {new Date(member.joined_at).toLocaleDateString()}</div>
                          </div>
                          {isLeader && member.role !== 'Leader' && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handlePromoteMember(member.id, member.role === 'Moderator' ? 'Member' : 'Moderator')}
                                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors"
                              >
                                {member.role === 'Moderator' ? 'Demote' : 'Promote'}
                              </button>
                              <button
                                onClick={() => handleTransferLeadership(member.id)}
                                className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 rounded text-sm transition-colors"
                              >
                                Transfer Leadership
                              </button>
                              <button
                                onClick={() => handleKickMember(member.id)}
                                className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm transition-colors"
                              >
                                Kick
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="bg-gray-900/50 border border-purple-500/30 rounded-lg p-4">
                <h3 className="font-bold mb-3">Quick Stats</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Members</span>
                    <span className="font-bold text-green-400">{members.length}/{clan.max_members}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Clan Level</span>
                    <span className="font-bold text-blue-400">{clan.level}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total XP</span>
                    <span className="font-bold text-purple-400">{clan.total_xp.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Your Role</span>
                    <span className={`font-bold ${userMembership?.role === 'Leader' ? 'text-yellow-400' : userMembership?.role === 'Moderator' ? 'text-blue-400' : 'text-gray-400'}`}>
                      {userMembership?.role || 'Member'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Your Contribution */}
              <div className="bg-gray-900/50 border border-purple-500/30 rounded-lg p-4">
                <h3 className="font-bold mb-3">Your Contribution</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">XP Contributed</span>
                    <span className="font-bold text-purple-400">{userMembership?.xp_contributed || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Member Since</span>
                    <span className="font-bold text-gray-400">
                      {userMembership ? new Date(userMembership.joined_at).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Your Level</span>
                    <span className="font-bold text-green-400">{userProfile?.level || 1}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
