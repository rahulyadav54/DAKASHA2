'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useAuth } from '../provider';

/**
 * Hook to manage user authentication state.
 * Returns the current Firebase User or a Mock User for Demo Mode.
 */
export function useUser() {
  const { auth } = useAuth();
  const [user, setUser] = useState<(User & { isGuest?: boolean }) | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Initial check for demo user in local storage
    const getDemoUser = () => {
      if (typeof window === 'undefined') return null;
      const demoUserJson = localStorage.getItem('demo_user');
      if (demoUserJson) {
        try {
          return { ...JSON.parse(demoUserJson), isGuest: true };
        } catch (e) {
          console.error("Failed to parse demo user", e);
        }
      }
      return null;
    };

    const demoUser = getDemoUser();
    
    // If no Firebase auth instance (e.g. config error), fallback to demo user immediately
    if (!auth) {
      setUser(demoUser);
      setLoading(false);
      return;
    }
    
    // 2. Listen to Firebase Auth state
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Real user found, clear demo if it exists
        setUser(firebaseUser);
      } else {
        // No real user, check if we have a demo user
        const currentDemo = getDemoUser();
        setUser(currentDemo);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  return { user, loading };
}
