/**
 * Backend Initializer Component
 * Handles user registration, profile check, and Socket.IO connection
 */

'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export function BackendInitializer({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();
  const pathname = usePathname();
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (isLoaded && user) {
      checkProfileCompletion();
    } else if (isLoaded) {
      setChecking(false);
    }
  }, [isLoaded, user, pathname]);

  const checkProfileCompletion = async () => {
    try {
      if (!user) return;

      // Skip check if already on onboarding, auth, sign-in, or sign-up pages
      if (pathname.startsWith('/onboarding') || 
          pathname.startsWith('/auth') || 
          pathname.startsWith('/sign-in') || 
          pathname.startsWith('/sign-up') || 
          pathname === '/') {
        setChecking(false);
        return;
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .select('profile_completed')
        .eq('clerk_user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking profile:', error);
        setChecking(false);
        return;
      }

      // If no profile or profile not completed, redirect to onboarding
      if (!data || !data.profile_completed) {
        router.push('/onboarding');
      }
    } catch (error) {
      console.error('Error in profile check:', error);
    } finally {
      setChecking(false);
    }
  };

  // Show loading only on protected routes while checking profile
  const isProtectedRoute = pathname.startsWith('/dashboard') || 
                          pathname.startsWith('/habits') || 
                          pathname.startsWith('/settings') ||
                          pathname.startsWith('/leaderboard');

  if (checking && isProtectedRoute) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
