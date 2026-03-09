'use client';

import { useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { useAuth } from '../provider';

/**
 * Hook to manage user state. 
 * Modified for Prototyping: Provides a persistent Guest User if no one is logged in.
 */
export function useUser() {
  const { auth } = useAuth();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
      } else {
        // Provide a mock guest user for the prototype
        setUser({
          uid: 'guest-user',
          displayName: 'Guest Learner',
          email: 'guest@smartread.ai',
          photoURL: 'https://picsum.photos/seed/guest/100/100',
          isGuest: true
        });
      }
      setLoading(false);
    });
  }, [auth]);

  return { user, loading };
}