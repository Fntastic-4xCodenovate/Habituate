'use client';

import { UserButton, useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Trophy, Target, User, Award, Zap, Users } from 'lucide-react';
import { useState, useEffect } from 'react';
import { type UserBadge } from '@/lib/api';
import { supabase } from '@/lib/supabase';

export default function Navbar() {
  const { user, isSignedIn } = useUser();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [userStats, setUserStats] = useState<{ xp: number; level: number } | null>(null);
  
  useEffect(() => {
    if (user?.id) {
      loadUserData();
    }
  }, [user?.id]);
  
  const loadUserData = async () => {
    try {
      if (!user?.id) return;
      
      // Check if user has completed onboarding
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('profile_completed, xp, level')
        .eq('clerk_user_id', user.id)
        .single();
      
      if (!profile || !profile.profile_completed) {
        // User hasn't completed onboarding, don't load data
        return;
      }
      
      // Load badges from Supabase
      const { data: badgesData } = await supabase
        .from('user_badges')
        .select('*, badges(*)')
        .eq('user_id', profile)
        .order('earned_at', { ascending: false })
        .limit(3);
      
      if (badgesData) {
        setBadges(badgesData.map(ub => ({
          badge_id: ub.badges.id,
          badge: ub.badges,
          earned_at: ub.earned_at,
        })));
      }
      
      setUserStats({ xp: profile.xp, level: profile.level });
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const navLinks = isSignedIn ? [
    { href: '/dashboard', label: 'Dashboard', icon: Target },
    { href: '/habits', label: 'Habits', icon: Target },
    { href: '/clan', label: 'Clan', icon: Users },
    { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
    { href: '/settings', label: 'Settings', icon: User },
  ] : [];

  return (
    <nav className="border-b border-purple-500/30 bg-black/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
  <img 
    src="/logo/logo.png" 
    alt="Habituate Logo" 
    className="h-20 w-auto"
  />
</Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center space-x-1 transition-colors ${
                    isActive
                      ? 'text-purple-400 neon-glow'
                      : 'text-gray-300 hover:text-purple-400'
                  }`}
                >
                  <Icon size={18} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
            
            {isSignedIn && userStats && (
              <div className="flex items-center space-x-4 pl-4 border-l border-purple-500/30">
                {/* Level & XP */}
                <div className="flex items-center space-x-2 px-3 py-1.5 bg-purple-600/20 rounded-lg border border-purple-500/30">
                  <Zap size={16} className="text-yellow-400" />
                  <div className="text-sm">
                    <span className="font-bold text-purple-400">Lv {userStats.level}</span>
                    <span className="text-gray-400 ml-1">• {userStats.xp} XP</span>
                  </div>
                </div>
                
                {/* Badges */}
                {badges.length > 0 && (
                  <div className="flex items-center space-x-1">
                    {badges.map((userBadge, idx) => (
                      <div
                        key={idx}
                        className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/50 flex items-center justify-center hover:scale-110 transition-transform cursor-pointer"
                        title={userBadge.badge.name}
                      >
                        <span className="text-lg">{userBadge.badge.icon}</span>
                      </div>
                    ))}
                    <Link
                      href="/profile"
                      className="w-8 h-8 rounded-full bg-purple-600/20 border border-purple-500/50 flex items-center justify-center hover:bg-purple-600/40 transition-colors"
                    >
                      <Award size={16} className="text-purple-400" />
                    </Link>
                  </div>
                )}
              </div>
            )}
            
            {isSignedIn ? (
              <Link href="/profile" className="border border-purple-500/50 rounded-full p-0.5 hover:border-purple-400 transition-colors">
                <div className="w-8 h-8 rounded-full overflow-hidden">
                  <img
                    src={user?.imageUrl || '/avatars/default.png'}
                    alt={user?.username || 'Profile'}
                    className="w-full h-full object-cover"
                  />
                </div>
              </Link>
            ) : (
              <Link
                href="/sign-in"
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors neon-border"
              >
                Sign In / Sign Up
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-gray-300 hover:text-white"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-purple-600/20 text-purple-400'
                      : 'text-gray-300 hover:bg-purple-500/10'
                  }`}
                >
                  <Icon size={18} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
            
            {!isSignedIn && (
              <div className="px-4 pt-4 border-t border-purple-500/30">
                <Link
                  href="/sign-in"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2 text-center rounded-lg bg-purple-600 hover:bg-purple-700 transition-colors"
                >
                  Sign In / Sign Up
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
