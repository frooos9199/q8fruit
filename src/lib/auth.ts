import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  updateProfile,
  User
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

// أنواع البيانات
export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  role: 'admin' | 'user';
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const normalizeString = (value: unknown, fallback = ''): string => {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  return fallback;
};

const normalizeAddress = (value: unknown): string => {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object') {
    const candidate = value as Record<string, unknown>;
    return normalizeString(
      candidate.fullAddress ?? candidate.address ?? candidate.name ?? candidate.label,
      ''
    );
  }
  return '';
};

export const normalizeUserProfile = (raw: Partial<UserProfile> | Record<string, unknown>, uidFallback = ''): UserProfile => {
  const roleValue = raw.role;
  const normalizedRole = roleValue === 'admin' || roleValue === 'مدير' ? 'admin' : 'user';

  return {
    uid: normalizeString(raw.uid, uidFallback),
    name: normalizeString(raw.name),
    email: normalizeString(raw.email),
    phone: normalizeString(raw.phone),
    address: normalizeAddress(raw.address),
    role: normalizedRole,
    active: raw.active !== false,
    createdAt: raw.createdAt instanceof Date ? raw.createdAt : new Date(),
    updatedAt: raw.updatedAt instanceof Date ? raw.updatedAt : new Date(),
  };
};

// تسجيل مستخدم جديد
export const registerUser = async (userData: {
  name: string;
  email: string;
  password: string;
  phone: string;
}) => {
  if (!auth || !db) throw new Error('Firebase غير مهيأ');

  // التحقق من قوة كلمة المرور
  if (userData.password.length < 6) {
    throw new Error('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
  }

  // التحقق من صحة رقم الهاتف
  if (!/^\d{8}$/.test(userData.phone)) {
    throw new Error('رقم الهاتف يجب أن يكون 8 أرقام');
  }

  try {
    // إنشاء المستخدم في Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      userData.email,
      userData.password
    );

    // تحديث الملف الشخصي
    await updateProfile(userCredential.user, {
      displayName: userData.name
    });

    // حفظ بيانات إضافية في Firestore
    const userProfile: UserProfile = {
      uid: userCredential.user.uid,
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      role: userData.email === 'summit_kw@hotmail.com' ? 'admin' : 'user',
      active: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await setDoc(doc(db, 'users', userCredential.user.uid), userProfile);

    return { user: userCredential.user, profile: normalizeUserProfile(userProfile, userCredential.user.uid) };
  } catch (error: unknown) {
    // ترجمة رسائل الخطأ
    const err = error as { code?: string };
    if (err.code === 'auth/email-already-in-use') {
      throw new Error('البريد الإلكتروني مستخدم بالفعل');
    } else if (err.code === 'auth/invalid-email') {
      throw new Error('البريد الإلكتروني غير صحيح');
    } else if (err.code === 'auth/weak-password') {
      throw new Error('كلمة المرور ضعيفة');
    }
    throw error;
  }
};

// تسجيل الدخول
export const loginUser = async (email: string, password: string) => {
  if (!auth || !db) throw new Error('Firebase غير مهيأ');

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // جلب بيانات المستخدم من Firestore
    const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
    
    if (!userDoc.exists()) {
      throw new Error('بيانات المستخدم غير موجودة');
    }

    const profile = normalizeUserProfile(userDoc.data() as UserProfile, userCredential.user.uid);
    
    // التحقق من أن الحساب مفعل
    if (!profile.active) {
      await signOut(auth);
      throw new Error('حسابك موقوف، يرجى التواصل مع الإدارة');
    }

    return { user: userCredential.user, profile };
  } catch (error: unknown) {
    // معالجة أخطاء تسجيل الدخول
    const err = error as { code?: string };
    if (err.code === 'auth/user-not-found') {
      throw new Error('المستخدم غير موجود');
    } else if (err.code === 'auth/wrong-password') {
      throw new Error('كلمة المرور غير صحيحة');
    } else if (err.code === 'auth/invalid-credential') {
      throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة');
    } else if (err.code === 'auth/invalid-email') {
      throw new Error('البريد الإلكتروني غير صحيح');
    } else if (err.code === 'auth/user-disabled') {
      throw new Error('هذا الحساب معطل');
    } else if (err.code === 'auth/too-many-requests') {
      throw new Error('محاولات كثيرة، حاول مرة أخرى لاحقاً');
    }
    throw error;
  }
};

// تسجيل الخروج
export const logoutUser = async () => {
  if (!auth) throw new Error('Firebase غير مهيأ');
  await signOut(auth);
};

// إرسال رابط استعادة كلمة المرور
export const resetPassword = async (email: string) => {
  if (!auth) throw new Error('Firebase غير مهيأ');
  
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: unknown) {
    const err = error as { code?: string };
    if (err.code === 'auth/user-not-found') {
      throw new Error('البريد الإلكتروني غير مسجل');
    }
    throw error;
  }
};

// تحديث بيانات المستخدم
export const updateUserProfile = async (uid: string, updates: Partial<UserProfile>) => {
  if (!db) throw new Error('Firebase غير مهيأ');
  
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    ...updates,
    updatedAt: new Date()
  });
};

// جلب بيانات المستخدم
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  if (!db) throw new Error('Firebase غير مهيأ');
  
  const userDoc = await getDoc(doc(db, 'users', uid));
  return userDoc.exists() ? normalizeUserProfile(userDoc.data() as UserProfile, uid) : null;
};