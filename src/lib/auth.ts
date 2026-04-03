import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  updateProfile,
  User
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

// أنواع البيانات
export interface UserProfile {
  uid: string;
  id?: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  role: 'admin' | 'user';
  active: boolean;
  isAdmin?: boolean;
  isBlocked?: boolean;
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

const normalizeDate = (value: unknown): Date => {
  if (value instanceof Date) return value;
  if (value && typeof value === 'object' && typeof (value as { toDate?: () => Date }).toDate === 'function') {
    return (value as { toDate: () => Date }).toDate();
  }

  const parsedDate = value ? new Date(value as string | number | Date) : null;
  return parsedDate && !Number.isNaN(parsedDate.getTime()) ? parsedDate : new Date();
};

const resolveUserRole = (raw: Partial<UserProfile> | Record<string, unknown>) => {
  const roleValue = normalizeString((raw as { role?: unknown }).role).toLowerCase();
  const isAdmin = (raw as { isAdmin?: unknown }).isAdmin === true || roleValue === 'admin' || roleValue === 'مدير';
  return isAdmin ? 'admin' : 'user';
};

const toFirestoreUserProfile = (
  raw: Partial<UserProfile> | Record<string, unknown>,
  uidFallback = ''
): UserProfile => {
  const uid = normalizeString((raw as { uid?: unknown; id?: unknown }).uid ?? (raw as { id?: unknown }).id, uidFallback);
  const role = resolveUserRole(raw);
  const isBlocked = (raw as { isBlocked?: unknown }).isBlocked === true || (raw as { active?: unknown }).active === false;
  const createdAt = normalizeDate((raw as { createdAt?: unknown }).createdAt);

  return {
    uid,
    id: uid,
    name: normalizeString((raw as { name?: unknown }).name),
    email: normalizeString((raw as { email?: unknown }).email).trim().toLowerCase(),
    phone: normalizeString((raw as { phone?: unknown }).phone),
    address: normalizeAddress((raw as { address?: unknown }).address),
    role,
    isAdmin: role === 'admin',
    active: !isBlocked,
    isBlocked,
    createdAt,
    updatedAt: new Date(),
  };
};

export const persistUserSession = (profile: UserProfile) => {
  if (typeof window === 'undefined') return;

  const cachedUser = {
    uid: profile.uid,
    id: profile.uid,
    name: profile.name,
    email: profile.email,
    phone: profile.phone,
    address: profile.address || '',
    role: profile.role,
    roleLabel: profile.role === 'admin' ? 'مدير' : 'عميل',
    active: profile.active,
    isAdmin: profile.role === 'admin',
  };

  window.localStorage.setItem('isAdmin', profile.role === 'admin' ? 'true' : 'false');
  window.localStorage.setItem('currentUser', JSON.stringify(cachedUser));
};

export const normalizeUserProfile = (raw: Partial<UserProfile> | Record<string, unknown>, uidFallback = ''): UserProfile => {
  const normalized = toFirestoreUserProfile(raw, uidFallback);

  return {
    ...normalized,
    createdAt: normalizeDate(normalized.createdAt),
    updatedAt: normalizeDate(normalized.updatedAt),
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
    const userProfile = toFirestoreUserProfile({
      uid: userCredential.user.uid,
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      role: userData.email.trim().toLowerCase() === 'summit_kw@hotmail.com' ? 'admin' : 'user',
      active: true,
      createdAt: new Date(),
    }, userCredential.user.uid);

    await setDoc(doc(db, 'users', userCredential.user.uid), userProfile, { merge: true });

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
    const userRef = doc(db, 'users', userCredential.user.uid);
    const userDoc = await getDoc(userRef);

    const profileSource = userDoc.exists()
      ? {
          ...userDoc.data(),
          uid: userCredential.user.uid,
          email: userDoc.data().email || userCredential.user.email || email,
          name: userDoc.data().name || userCredential.user.displayName || '',
        }
      : {
          uid: userCredential.user.uid,
          name: userCredential.user.displayName || '',
          email: userCredential.user.email || email,
          phone: '',
          role: userCredential.user.email?.trim().toLowerCase() === 'summit_kw@hotmail.com' ? 'admin' : 'user',
          active: true,
          createdAt: new Date(),
        };

    const normalizedProfile = toFirestoreUserProfile(profileSource, userCredential.user.uid);
    await setDoc(userRef, normalizedProfile, { merge: true });

    const profile = normalizeUserProfile(normalizedProfile, userCredential.user.uid);
    
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
  const currentProfile = await getUserProfile(uid);
  const nextProfile = toFirestoreUserProfile({
    ...(currentProfile || { uid, createdAt: new Date() }),
    ...updates,
    uid,
  }, uid);

  await setDoc(userRef, nextProfile, { merge: true });

  return normalizeUserProfile(nextProfile, uid);
};

// جلب بيانات المستخدم
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  if (!db) throw new Error('Firebase غير مهيأ');
  
  const userDoc = await getDoc(doc(db, 'users', uid));
  return userDoc.exists() ? normalizeUserProfile(userDoc.data() as UserProfile, uid) : null;
};