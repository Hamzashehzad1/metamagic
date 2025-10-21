
'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebase() {
  if (getApps().length) {
    return getSdks(getApp());
  }

  // This is the recommended way to initialize Firebase in a Next.js app.
  // It handles both server-side and client-side initialization.
  const isAppHosting = process.env.NEXT_PUBLIC_FIREBASE_APP_HOSTING_URL;
  let firebaseApp;

  if (isAppHosting) {
    // In the App Hosting environment, `initializeApp` is called without arguments.
    // It will automatically be configured with the project's resources.
    firebaseApp = initializeApp();
  } else {
    // In a local development environment, `initializeApp` is called with the config object.
    firebaseApp = initializeApp(firebaseConfig);
  }
  
  return getSdks(firebaseApp);
}

export function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp)
  };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';

