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
    // Check for demo user in local storage first to support bypass mode
    const checkUser = () => {
      const demoUserJson = typeof window !== 'undefined' ? localStorage.getItem('demo_user') : null;
      if (demoUserJson) {
        try {
          const demoUser = JSON.parse(demoUserJson);
          setUser({ ...demoUser, isGuest: true });
          setLoading(false);
          return true;
        } catch (e) {
          console.error("Failed to parse demo user", e);
        }
      }
      return false;
    };

    if (checkUser()) return;

    if (!auth) {
      setLoading(false);
      return;
    }
    
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
      } else {
        // Double check demo user one last time in case it was just set
        if (!checkUser()) {
          setUser(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  return { user, loading };
}
