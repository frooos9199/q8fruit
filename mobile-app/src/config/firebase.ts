import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getAuth, Auth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBWDfM_mMWrWiYNzkrWYWtmkznPrzHCDHA",
  authDomain: "fruitq8-b9cb6.firebaseapp.com",
  projectId: "fruitq8-b9cb6",
  storageBucket: "fruitq8-b9cb6.firebasestorage.app",
  messagingSenderId: "452768607267",
  appId: "1:452768607267:web:7fac92c44dcb80c8ede27c",
  measurementId: "G-RLN5XJKXW9"
};

let app: FirebaseApp;
let db: Firestore;
let storage: FirebaseStorage;
let auth: Auth;

export const initializeFirebase = async () => {
  try {
    // تحقق إذا كان Firebase مهيأ مسبقاً
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApp();
    }
    
    db = getFirestore(app);
    storage = getStorage(app);
    auth = getAuth(app);
    
    console.log('✅ تم تهيئة Firebase بنجاح');
    return { app, db, storage, auth };
  } catch (error) {
    console.error('❌ خطأ في تهيئة Firebase:', error);
    throw error;
  }
};

export const getFirebaseDb = () => db;
export const getFirebaseStorage = () => storage;
export const getFirebaseAuth = () => auth;
