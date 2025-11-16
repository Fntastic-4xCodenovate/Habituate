'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, User, MapPin, Loader2, Save, Edit2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { supabase } from '@/lib/supabase';

interface UserProfile {
  id: string;
  clerk_user_id: string;
  email: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  region: string;
  bio: string;
  xp: number;
  level: number;
  extra_lives: number;
}

export default function SettingsPage() {
  const { user, isLoaded } = useUser();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    displayName: '',
    region: '',
    bio: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (isLoaded && user) {
      loadProfile();
    }
  }, [isLoaded, user]);

  const loadProfile = async () => {
    try {
      if (!user) return;

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('clerk_user_id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        setProfile(data);
        setFormData({
          displayName: data.display_name || '',
          region: data.region || '',
          bio: data.bio || '',
        });
        setAvatarPreview(data.avatar_url);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ ...errors, avatar: 'Avatar must be less than 5MB' });
        return;
      }

      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setErrors({ ...errors, avatar: '' });
    }
  };

  const uploadAvatar = async (): Promise<string | null> => {
    if (!avatarFile || !user) return null;

    setUploadingAvatar(true);
    try {
      const fileExt = avatarFile.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, avatarFile, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      setErrors({ ...errors, avatar: 'Failed to upload avatar' });
      return null;
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !profile) return;

    setSaving(true);
    setSuccessMessage('');
    setErrors({});

    try {
      // Upload avatar if changed
      let avatarUrl = profile.avatar_url;
      if (avatarFile) {
        const uploadedUrl = await uploadAvatar();
        if (uploadedUrl) {
          avatarUrl = uploadedUrl;
        }
      }

      // Update profile
      const { error } = await supabase
        .from('user_profiles')
        .update({
          display_name: formData.displayName,
          region: formData.region,
          bio: formData.bio,
          avatar_url: avatarUrl,
        })
        .eq('clerk_user_id', user.id);

      if (error) throw error;

      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      
      // Reload profile
      await loadProfile();
      setAvatarFile(null);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setErrors({ submit: error.message || 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  if (!isLoaded || loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="animate-spin text-purple-500" size={48} />
        </div>
      </>
    );
  }

  if (!profile) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-gray-400">Profile not found</p>
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
            <h1 className="text-4xl md:text-5xl font-bold mb-2 glitch-text neon-glow" data-text="Settings">
              Settings
            </h1>
            <p className="text-gray-400">Manage your profile and preferences</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Profile Stats Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="md:col-span-1 p-6 rounded-lg border border-purple-500/30 bg-black/40 backdrop-blur-sm h-fit"
            >
              <div className="text-center">
                <div className="w-32 h-32 mx-auto rounded-full border-2 border-purple-500/50 overflow-hidden bg-purple-900/20 flex items-center justify-center mb-4">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User size={64} className="text-purple-400/50" />
                  )}
                </div>
                <h2 className="text-2xl font-bold mb-1">{profile.display_name || profile.username}</h2>
                <p className="text-gray-400 mb-4">@{profile.username}</p>
                
                <div className="space-y-3">
                  <div className="p-3 bg-purple-600/10 rounded-lg">
                    <p className="text-sm text-gray-400">Level</p>
                    <p className="text-2xl font-bold text-purple-400">{profile.level}</p>
                  </div>
                  <div className="p-3 bg-blue-600/10 rounded-lg">
                    <p className="text-sm text-gray-400">Total XP</p>
                    <p className="text-2xl font-bold text-blue-400">{profile.xp}</p>
                  </div>
                  <div className="p-3 bg-green-600/10 rounded-lg">
                    <p className="text-sm text-gray-400">Extra Lives</p>
                    <p className="text-2xl font-bold text-green-400">{profile.extra_lives}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Settings Form */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="md:col-span-2"
            >
              <form onSubmit={handleSubmit} className="space-y-6 p-6 rounded-lg border border-purple-500/30 bg-black/40 backdrop-blur-sm">
                <h3 className="text-xl font-bold mb-4">Edit Profile</h3>

                {/* Avatar Upload */}
                <div>
                  <label className="block text-sm font-medium mb-2">Profile Picture</label>
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 rounded-full border-2 border-purple-500/50 overflow-hidden bg-purple-900/20 flex items-center justify-center">
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <User size={32} className="text-purple-400/50" />
                      )}
                    </div>
                    <div>
                      <label
                        htmlFor="avatar"
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg cursor-pointer transition-colors inline-flex items-center space-x-2"
                      >
                        {uploadingAvatar ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            <span>Uploading...</span>
                          </>
                        ) : (
                          <>
                            <Upload size={16} />
                            <span>Change Avatar</span>
                          </>
                        )}
                      </label>
                      <input
                        type="file"
                        id="avatar"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                        disabled={uploadingAvatar}
                      />
                      <p className="text-xs text-gray-500 mt-1">Max 5MB</p>
                    </div>
                  </div>
                  {errors.avatar && <p className="text-sm text-red-400 mt-2">{errors.avatar}</p>}
                </div>

                {/* Username (Read-only) */}
                <div>
                  <label className="block text-sm font-medium mb-2">Username</label>
                  <input
                    type="text"
                    value={profile.username}
                    disabled
                    className="w-full px-4 py-3 bg-black/30 border border-purple-500/20 rounded-lg text-gray-500 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">Username cannot be changed</p>
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
                </div>

                {/* Region */}
                <div>
                  <label className="block text-sm font-medium mb-2">Region</label>
                  <select
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    className="w-full px-4 py-3 bg-black/50 border border-purple-500/30 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
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

                {/* Success Message */}
                {successMessage && (
                  <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <p className="text-green-400 text-sm">{successMessage}</p>
                  </div>
                )}

                {/* Error Message */}
                {errors.submit && (
                  <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <p className="text-red-400 text-sm">{errors.submit}</p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={saving || uploadingAvatar}
                  className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 disabled:cursor-not-allowed rounded-lg transition-colors font-semibold flex items-center justify-center space-x-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save size={20} />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </main>
    </>
  );
}
