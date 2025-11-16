'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '@clerk/nextjs';
import Navbar from '@/components/Navbar';
import ClanChat from '@/components/ClanChat';
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
  Edit
} from 'lucide-react';

// Mock data - replace with real data from your backend
const mockClanData = {
  name: "Shadow Warriors",
  level: 15,
  xp: 45000,
  xpToNextLevel: 50000,
  motto: "Together we rise, divided we fall",
  color: "#8b5cf6",
  banner: "/media/clan-banner.jpg",
  image: "/avatars/clan-logo.png",
  members: 24,
  maxMembers: 50,
  isLeader: true, // Set based on user role
  rules: [
    "Be respectful to all members",
    "Complete daily quests",
    "Help others grow",
    "Stay active"
  ]
};

const mockMembers = [
  { id: 1, name: "DragonSlayer", level: 25, xp: 12000, role: "Leader", avatar: "/avatars/1.png", status: "online" },
  { id: 2, name: "MysticMage", level: 22, xp: 9500, role: "Moderator", avatar: "/avatars/2.png", status: "online" },
  { id: 3, name: "StealthNinja", level: 20, xp: 8200, role: "Member", avatar: "/avatars/3.png", status: "offline" },
  { id: 4, name: "PhoenixRider", level: 18, xp: 7100, role: "Member", avatar: "/avatars/4.png", status: "online" },
  { id: 5, name: "IronKnight", level: 16, xp: 6300, role: "Member", avatar: "/avatars/5.png", status: "offline" },
];

const mockQuests = [
  { id: 1, title: "Team Spirit", description: "Have 10 members complete habits", progress: 7, goal: 10, reward: 500 },
  { id: 2, title: "Streak Masters", description: "Maintain 30-day clan streak", progress: 18, goal: 30, reward: 1000 },
  { id: 3, title: "XP Grinders", description: "Earn 5000 collective XP", progress: 3200, goal: 5000, reward: 750 },
];

const mockMessages = [
  { id: 1, user: "DragonSlayer", message: "Great work everyone! We're crushing it today!", time: "2m ago", avatar: "/avatars/1.png" },
  { id: 2, user: "MysticMage", message: "Who wants to team up for the daily quest?", time: "15m ago", avatar: "/avatars/2.png" },
  { id: 3, user: "StealthNinja", message: "Just hit level 20! 🎉", time: "1h ago", avatar: "/avatars/3.png" },
];

const mockPendingMembers = [
  { id: 1, name: "NewWarrior", level: 12, avatar: "/avatars/pending1.png" },
  { id: 2, name: "QuestSeeker", level: 15, avatar: "/avatars/pending2.png" },
];

export default function ClanPage() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState('overview');
  const [showSettings, setShowSettings] = useState(false);
  const [message, setMessage] = useState('');
  const [clanData, setClanData] = useState(mockClanData);
  
  // Settings states
  const [editName, setEditName] = useState(clanData.name);
  const [editMotto, setEditMotto] = useState(clanData.motto);
  const [editColor, setEditColor] = useState(clanData.color);
  const [editRules, setEditRules] = useState(clanData.rules.join('\n'));

  const handleSendMessage = () => {
    if (message.trim()) {
      // TODO: Send message to backend
      console.log('Sending message:', message);
      setMessage('');
    }
  };

  const handleAcceptMember = (memberId: number) => {
    // TODO: Accept member via backend
    console.log('Accepting member:', memberId);
  };

  const handleRejectMember = (memberId: number) => {
    // TODO: Reject member via backend
    console.log('Rejecting member:', memberId);
  };

  const handleSaveSettings = () => {
    // TODO: Save settings to backend
    setClanData({
      ...clanData,
      name: editName,
      motto: editMotto,
      color: editColor,
      rules: editRules.split('\n').filter(r => r.trim())
    });
    setShowSettings(false);
  };

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
            <div 
              className="h-48 bg-gradient-to-r from-purple-900 to-blue-900 relative"
              style={{ backgroundColor: clanData.color }}
            >
              <div className="absolute inset-0 bg-black/40" />
              <div className="absolute bottom-4 left-4 flex items-end gap-4">
                {/* Clan Image */}
                <div className="w-24 h-24 rounded-lg border-4 border-white bg-purple-600 flex items-center justify-center text-4xl font-bold">
                  {clanData.name[0]}
                </div>
                <div className="mb-2">
                  <h1 className="text-4xl font-bold text-white flex items-center gap-2">
                    {clanData.name}
                    {clanData.isLeader && <Crown className="text-yellow-400" size={32} />}
                  </h1>
                  <p className="text-gray-300 italic">&ldquo;{clanData.motto}&rdquo;</p>
                </div>
              </div>
              {clanData.isLeader && (
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
                  <div className="text-2xl font-bold text-purple-400">Level {clanData.level}</div>
                  <div className="text-sm text-gray-400">Clan Level</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">{clanData.members}/{clanData.maxMembers}</div>
                  <div className="text-sm text-gray-400">Members</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">{clanData.xp.toLocaleString()}</div>
                  <div className="text-sm text-gray-400">Total XP</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">{mockQuests.length}</div>
                  <div className="text-sm text-gray-400">Active Quests</div>
                </div>
              </div>
              {/* XP Progress Bar */}
              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-400 mb-1">
                  <span>Progress to Level {clanData.level + 1}</span>
                  <span>{clanData.xp}/{clanData.xpToNextLevel} XP</span>
                </div>
                <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500"
                    style={{ width: `${(clanData.xp / clanData.xpToNextLevel) * 100}%` }}
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
              { id: 'quests', label: 'Quests', icon: Award },
              ...(clanData.isLeader ? [{ id: 'manage', label: 'Manage', icon: Shield }] : [])
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
                  {/* Clan Rules */}
                  <div className="bg-gray-900/50 border border-purple-500/30 rounded-lg p-6">
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                      <Shield className="text-purple-400" />
                      Clan Rules
                    </h2>
                    <ul className="space-y-2">
                      {clanData.rules.map((rule, index) => (
                        <li key={index} className="flex items-start gap-2 text-gray-300">
                          <span className="text-purple-400 font-bold">{index + 1}.</span>
                          {rule}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Top Contributors */}
                  <div className="bg-gray-900/50 border border-purple-500/30 rounded-lg p-6">
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                      <TrendingUp className="text-green-400" />
                      Top Contributors This Week
                    </h2>
                    <div className="space-y-3">
                      {mockMembers.slice(0, 5).map((member, index) => (
                        <div key={member.id} className="flex items-center gap-3 p-3 bg-black/40 rounded-lg">
                          <div className={`text-2xl font-bold ${index === 0 ? 'text-yellow-400' : index === 1 ? 'text-gray-400' : index === 2 ? 'text-orange-600' : 'text-gray-500'}`}>
                            #{index + 1}
                          </div>
                          <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold">
                            {member.name[0]}
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold">{member.name}</div>
                            <div className="text-sm text-gray-400">Level {member.level}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-purple-400">{member.xp} XP</div>
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
                    Clan Members ({mockMembers.length}/{clanData.maxMembers})
                  </h2>
                  <div className="space-y-3">
                    {mockMembers.map(member => (
                      <div key={member.id} className="flex items-center gap-3 p-4 bg-black/40 rounded-lg hover:bg-black/60 transition-colors">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-lg">
                            {member.name[0]}
                          </div>
                          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-gray-900 ${member.status === 'online' ? 'bg-green-500' : 'bg-gray-500'}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-lg">{member.name}</span>
                            {member.role === 'Leader' && <Crown className="text-yellow-400" size={16} />}
                            {member.role === 'Moderator' && <Shield className="text-blue-400" size={16} />}
                          </div>
                          <div className="text-sm text-gray-400">{member.role} • Level {member.level}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-purple-400">{member.xp} XP</div>
                          <div className="text-xs text-gray-500">{member.status}</div>
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
                    clanId={mockClanData.name.toLowerCase().replace(/\s+/g, '-')}
                    userId={user?.id || 'guest'}
                    userName={user?.fullName || user?.username || 'Guest'}
                  />
                </motion.div>
              )}

              {activeTab === 'quests' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-gray-900/50 border border-purple-500/30 rounded-lg p-6"
                >
                  <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <Award className="text-yellow-400" />
                    Daily Clan Quests
                  </h2>
                  <div className="space-y-4">
                    {mockQuests.map(quest => (
                      <div key={quest.id} className="bg-black/40 rounded-lg p-4 border border-purple-500/20">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="text-xl font-bold text-purple-400">{quest.title}</h3>
                            <p className="text-gray-400">{quest.description}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-yellow-400 font-bold">+{quest.reward} XP</div>
                          </div>
                        </div>
                        <div className="mt-3">
                          <div className="flex justify-between text-sm text-gray-400 mb-1">
                            <span>Progress</span>
                            <span>{quest.progress}/{quest.goal}</span>
                          </div>
                          <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-green-500 to-blue-500"
                              style={{ width: `${(quest.progress / quest.goal) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'manage' && clanData.isLeader && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  {/* Pending Members */}
                  {mockPendingMembers.length > 0 && (
                    <div className="bg-gray-900/50 border border-purple-500/30 rounded-lg p-6">
                      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                        <UserPlus className="text-orange-400" />
                        Pending Members ({mockPendingMembers.length})
                      </h2>
                      <div className="space-y-3">
                        {mockPendingMembers.map(member => (
                          <div key={member.id} className="flex items-center gap-3 p-3 bg-black/40 rounded-lg">
                            <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold">
                              {member.name[0]}
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold">{member.name}</div>
                              <div className="text-sm text-gray-400">Level {member.level}</div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleAcceptMember(member.id)}
                                className="p-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                              >
                                <Check size={20} />
                              </button>
                              <button
                                onClick={() => handleRejectMember(member.id)}
                                className="p-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                              >
                                <X size={20} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Clan Settings */}
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
                        <label className="block text-sm font-semibold mb-2">Clan Motto</label>
                        <input
                          type="text"
                          value={editMotto}
                          onChange={(e) => setEditMotto(e.target.value)}
                          className="w-full px-4 py-2 bg-black/40 border border-purple-500/30 rounded-lg focus:outline-none focus:border-purple-500 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2">Clan Color Theme</label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={editColor}
                            onChange={(e) => setEditColor(e.target.value)}
                            className="w-16 h-10 rounded cursor-pointer"
                          />
                          <input
                            type="text"
                            value={editColor}
                            onChange={(e) => setEditColor(e.target.value)}
                            className="flex-1 px-4 py-2 bg-black/40 border border-purple-500/30 rounded-lg focus:outline-none focus:border-purple-500 text-white"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2">Clan Rules (one per line)</label>
                        <textarea
                          value={editRules}
                          onChange={(e) => setEditRules(e.target.value)}
                          rows={6}
                          className="w-full px-4 py-2 bg-black/40 border border-purple-500/30 rounded-lg focus:outline-none focus:border-purple-500 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2">Upload Clan Banner</label>
                        <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors">
                          <Upload size={20} />
                          Upload Banner
                        </button>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2">Upload Clan Image</label>
                        <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors">
                          <Upload size={20} />
                          Upload Image
                        </button>
                      </div>
                      <button
                        onClick={handleSaveSettings}
                        className="w-full py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition-colors"
                      >
                        Save Changes
                      </button>
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
                    <span className="text-gray-400">Active Today</span>
                    <span className="font-bold text-green-400">12/24</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Quests Completed</span>
                    <span className="font-bold text-blue-400">156</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Clan Streak</span>
                    <span className="font-bold text-orange-400">18 days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Global Rank</span>
                    <span className="font-bold text-purple-400">#47</span>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-gray-900/50 border border-purple-500/30 rounded-lg p-4">
                <h3 className="font-bold mb-3">Recent Activity</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5" />
                    <div>
                      <p className="text-gray-300"><span className="font-semibold">DragonSlayer</span> completed a quest</p>
                      <p className="text-xs text-gray-500">5m ago</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5" />
                    <div>
                      <p className="text-gray-300"><span className="font-semibold">MysticMage</span> leveled up to 23</p>
                      <p className="text-xs text-gray-500">1h ago</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500 mt-1.5" />
                    <div>
                      <p className="text-gray-300">Clan reached Level 15!</p>
                      <p className="text-xs text-gray-500">3h ago</p>
                    </div>
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
