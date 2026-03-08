'use client';

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

/**
 * Firebase configuration for the ramiyaa-ff272 project.
 * 
 * IMPORTANT: You must replace the placeholders below with actual values
 * from your Firebase Console: Project Settings > General > Your apps.
 */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "REPLACE_WITH_YOUR_API_KEY",
  authDomain: "ramiyaa-ff272.firebaseapp.com",
  projectId: "ramiyaa-ff272",
  storageBucket: "ramiyaa-ff272.appspot.com",
  messagingSenderId: "104910758060289544716",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:104910758060289544716:web:example"
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
