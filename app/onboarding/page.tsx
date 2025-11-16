'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function OnboardingPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Random avatar assignment (upload disabled)
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  
  const [formData, setFormData] = useState({
    username: '',
    displayName: '',
    region: '',
    bio: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isLoaded && user) {
      checkExistingProfile();
      // Assign random avatar on mount
      const randomAvatar = getRandomAvatar();
      setAvatarUrl(randomAvatar);
    }
  }, [isLoaded, user]);

  // Get random avatar from available options
  const getRandomAvatar = () => {
    const avatars = [
      '/avatars/avatar1.svg',
      '/avatars/avatar2.svg',
      '/avatars/avatar3.svg',
      '/avatars/avatar4.svg',
      '/avatars/avatar5.svg',
      '/avatars/avatar6.svg',
      '/avatars/avatar7.svg',
      '/avatars/avatar8.svg',
    ];
    return avatars[Math.floor(Math.random() * avatars.length)];
  };

  const checkExistingProfile = async () => {
    try {
      if (!user) return;

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('clerk_user_id', user.id)
        .single();

      if (data && data.profile_completed) {
        // User already completed onboarding, redirect to dashboard
        router.push('/dashboard');
      } else if (data) {
        // Pre-fill form with existing data
        setFormData({
          username: data.username || '',
          displayName: data.display_name || '',
          region: data.region || '',
          bio: data.bio || '',
        });
        if (data.avatar_url) {
          setAvatarUrl(data.avatar_url);
        }
      }
    } catch (error) {
      console.error('Error checking profile:', error);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    }

    if (!formData.region.trim()) {
      newErrors.region = 'Region is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !user) return;

    setLoading(true);

    try {
      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('clerk_user_id', user.id)
        .single();

      const profileData = {
        clerk_user_id: user.id,
        email: user.emailAddresses[0]?.emailAddress || '',
        username: formData.username.toLowerCase(),
        display_name: formData.displayName || formData.username,
        region: formData.region,
        bio: formData.bio,
        avatar_url: avatarUrl,
        profile_completed: true,
      };

      if (existingProfile) {
        // Update existing profile
        const {error} = await supabase
          .from('user_profiles')
          .update(profileData)
          .eq('clerk_user_id', user.id);

        if (error) throw error;
      } else {
        // Create new profile
        const { error } = await supabase
          .from('user_profiles')
          .insert([profileData]);

        if (error) {
          if (error.code === '23505') {
            // Unique constraint violation
            setErrors({username: 'Username is already taken' });
            setLoading(false);
            return;
          }
          throw error;
        }
      }

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Error saving profile:', error);
      setErrors({ submit: error.message || 'Failed to save profile' });
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-purple-500" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 glitch-text neon-glow" data-text="Welcome!">
            Welcome!
          </h1>
          <p className="text-gray-400">Complete your profile to get started</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 p-8 rounded-lg border border-purple-500/30 bg-black/40 backdrop-blur-sm">
          {/* Avatar Display - Upload disabled */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-2 border-purple-500/50 overflow-hidden bg-purple-900/20 flex items-center justify-center">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User size={64} className="text-purple-400/50" />
                )}
              </div>
            </div>
            <p className="text-sm text-gray-400">Your randomly assigned avatar</p>
            <p className="text-xs text-gray-500">(Avatar upload temporarily disabled)</p>
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Username (In-Game Name) <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full px-4 py-3 bg-black/50 border border-purple-500/30 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
              placeholder="cool_gamer_123"
              required
            />
            {errors.username && <p className="text-sm text-red-400 mt-1">{errors.username}</p>}
            <p className="text-xs text-gray-500 mt-1">This will be your unique identifier</p>
          </div>

          {/* Display Name */}
          <div>
            <label className="block text-sm font-medium mb-2">Display Name</label>
            <input
              type="text"
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              className="w-full px-4 py-3 bg-black/50 border border-purple-500/30 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
              placeholder="Cool Gamer"
            />
            <p className="text-xs text-gray-500 mt-1">How others will see your name</p>
          </div>

          {/* Region */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Region <span className="text-red-400">*</span>
            </label>
            <select
              value={formData.region}
              onChange={(e) => setFormData({ ...formData, region: e.target.value })}
              className="w-full px-4 py-3 bg-black/50 border border-purple-500/30 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
              required
            >
              <option value="">Select your region</option>
              <option value="NA">North America</option>
              <option value="EU">Europe</option>
              <option value="ASIA">Asia</option>
              <option value="OCE">Oceania</option>
              <option value="SA">South America</option>
              <option value="AF">Africa</option>
              <option value="ME">Middle East</option>
            </select>
            {errors.region && <p className="text-sm text-red-400 mt-1">{errors.region}</p>}
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium mb-2">Bio</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 bg-black/50 border border-purple-500/30 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
              placeholder="Tell us about yourself..."
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">{formData.bio.length}/500 characters</p>
          </div>

          {/* Error Message */}
          {errors.submit && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm">{errors.submit}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 disabled:cursor-not-allowed rounded-lg transition-colors font-semibold flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                <span>Saving Profile...</span>
              </>
            ) : (
              <span>Complete Setup</span>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
