'use client';

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDummyKey",
  authDomain: "ramiyaa-ff272.firebaseapp.com",
  projectId: "ramiyaa-ff272",
  storageBucket: "ramiyaa-ff272.appspot.com",
  messagingSenderId: "104910758060289544716",
  appId: "1:104910758060289544716:web:example"
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
