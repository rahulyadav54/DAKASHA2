'use client';

import React, { ReactNode } from 'react';
import { app, auth, db } from './config';
import { FirebaseProvider } from './provider';

export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  return (
    <FirebaseProvider app={app} auth={auth} firestore={db}>
      {children}
    </FirebaseProvider>
  );
}
