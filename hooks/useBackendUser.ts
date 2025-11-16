/**
 * Hook to sync Clerk user with backend
 * Automatically registers new users and maintains session
 */

import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { authAPI, type User } from '@/lib/api';
import { socketManager } from '@/lib/socket';

export function useBackendUser() {
  const { user: clerkUser, isLoaded } = useUser();
  const [backendUser, setBackendUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoaded && clerkUser) {
      initializeUser();
    } else if (isLoaded && !clerkUser) {
      setBackendUser(null);
      setLoading(false);
      socketManager.disconnect();
    }
  }, [isLoaded, clerkUser]);

  const initializeUser = async () => {
    try {
      if (!clerkUser) return;

      // Try to get existing user
      let user: User;
      try {
        user = await authAPI.getUser(clerkUser.id);
      } catch (err: any) {
        // If user doesn't exist (404), register them
        if (err.status === 404) {
          const email = clerkUser.emailAddresses[0]?.emailAddress || '';
          const username = clerkUser.username || clerkUser.firstName || 'User';
          user = await authAPI.register(clerkUser.id, email, username);
        } else {
          throw err;
        }
      }

      setBackendUser(user);
      
      // Connect Socket.IO for real-time features
      socketManager.connect(user.id);
      
      setError(null);
    } catch (err: any) {
      console.error('Error initializing backend user:', err);
      setError(err.message || 'Failed to connect to backend');
    } finally {
      setLoading(false);
    }
  };

  return {
    backendUser,
    loading: loading || !isLoaded,
    error,
    refresh: initializeUser,
  };
}
