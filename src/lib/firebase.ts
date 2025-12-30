import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getAuth, Auth } from 'firebase/auth';
import { getAnalytics, Analytics } from 'firebase/analytics';

// استيراد دالة إنشاء الأدمن
import './createAdmin';

// إعدادات Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBW2-EDd8K8Nq5Uj5fJFaeAzQnchjcdbJU",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "fruitq8-ba5ef.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "fruitq8-ba5ef",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "fruitq8-ba5ef.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "496410641214",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:496410641214:web:bc829a07ac23b9ba0ae26f",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-0HH05NRQ77"
};

// Initialize Firebase
let app: FirebaseApp;
let db: Firestore;
let storage: FirebaseStorage;
let auth: Auth;
let analytics: Analytics | null = null;

// تهيئة Firebase
try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  db = getFirestore(app);
  storage = getStorage(app);
  auth = getAuth(app);
  
  // Analytics يعمل فقط في المتصفح
  if (typeof window !== 'undefined') {
    try {
      analytics = getAnalytics(app);
    } catch (analyticsError) {
      console.warn('Analytics not available:', analyticsError);
      analytics = null;
    }
  }
} catch (error) {
  console.error('خطأ في تهيئة Firebase:', error);
  throw error;
}

export { app, db, storage, auth, analytics };

// دوال مساعدة للتحقق من حالة Firebase
export const isFirebaseInitialized = () => {
  return !!(app && db && storage && auth);
};

export const getFirebaseServices = () => {
  if (!isFirebaseInitialized()) {
    throw new Error('Firebase غير مُهيأ بشكل صحيح');
  }
  return { app, db, storage, auth, analytics };
};
