'use client';

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

/**
 * Firebase configuration for the ramiyaa-ff272 project.
 * Verified and updated with user-provided credentials.
 */
const firebaseConfig = {
  apiKey: "AIzaSyBlNohJjTsQweb1wy06wxWqAU5iXP8HrFU",
  authDomain: "ramiyaa-ff272.firebaseapp.com",
  projectId: "ramiyaa-ff272",
  storageBucket: "ramiyaa-ff272.firebasestorage.app",
  messagingSenderId: "569550053176",
  appId: "1:569550053176:web:dd5704f8641357d7002bcd",
  measurementId: "G-QQHVPCNY47"
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };