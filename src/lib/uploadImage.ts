/**
 * رفع صورة إلى Firebase Storage
 * @param file - ملف الصورة
 * @param folder - المجلد في Storage (مثل: 'products', 'catering', 'banners')
 * @returns رابط الصورة المرفوعة
 */
export async function uploadImage(file: File, folder: string = 'images'): Promise<string> {
  // التأكد من أننا في المتصفح
  if (typeof window === 'undefined') {
    throw new Error('يجب استخدام هذه الدالة في المتصفح فقط');
  }

  try {
    // استيراد Firebase ديناميكياً
    const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
    const { initializeApp, getApps } = await import('firebase/app');
    const { getStorage } = await import('firebase/storage');
    
    // Firebase config - استخدام المتغيرات البيئية
    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBW2-EDd8K8Nq5Uj5fJFaeAzQnchjcdbJU",
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "fruitq8-ba5ef.firebaseapp.com",
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "fruitq8-ba5ef",
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "fruitq8-ba5ef.firebasestorage.app",
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "496410641214",
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:496410641214:web:bc829a07ac23b9ba0ae26f",
    };
    
    // Initialize app
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    const storage = getStorage(app);
    
    // إنشاء اسم فريد للملف
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 9);
    const fileName = `${timestamp}_${randomString}_${file.name}`;
    
    // إنشاء المرجع في Storage
    const storageRef = ref(storage, `${folder}/${fileName}`);
    
    // رفع الملف
    const snapshot = await uploadBytes(storageRef, file);
    
    // الحصول على رابط التحميل
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error('خطأ في رفع الصورة:', error);
    throw new Error('فشل رفع الصورة');
  }
}

/**
 * رفع صورة Base64 إلى Firebase Storage
 * @param base64Data - البيانات بصيغة Base64
 * @param folder - المجلد في Storage
 * @returns رابط الصورة المرفوعة
 */
export async function uploadBase64Image(base64Data: string, folder: string = 'images'): Promise<string> {
  // التأكد من أننا في المتصفح
  if (typeof window === 'undefined') {
    throw new Error('يجب استخدام هذه الدالة في المتصفح فقط');
  }

  try {
    // استيراد Firebase ديناميكياً
    const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
    const { initializeApp, getApps } = await import('firebase/app');
    const { getStorage } = await import('firebase/storage');
    
    // Firebase config - استخدام المتغيرات البيئية
    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBW2-EDd8K8Nq5Uj5fJFaeAzQnchjcdbJU",
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "fruitq8-ba5ef.firebaseapp.com",
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "fruitq8-ba5ef",
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "fruitq8-ba5ef.firebasestorage.app",
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "496410641214",
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:496410641214:web:bc829a07ac23b9ba0ae26f",
    };
    
    // Initialize app
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    const storage = getStorage(app);
    
    // تحويل Base64 إلى Blob
    const response = await fetch(base64Data);
    const blob = await response.blob();
    
    // إنشاء اسم فريد للملف
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 9);
    const fileName = `${timestamp}_${randomString}.jpg`;
    
    // إنشاء المرجع في Storage
    const storageRef = ref(storage, `${folder}/${fileName}`);
    
    // رفع الملف
    const snapshot = await uploadBytes(storageRef, blob);
    
    // الحصول على رابط التحميل
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error('خطأ في رفع الصورة Base64:', error);
    throw new Error('فشل رفع الصورة');
  }
}
