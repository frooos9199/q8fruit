/**
 * ضغط الصورة لتقليل حجمها
 */
async function compressImage(file: File, maxWidth: number = 1200, quality: number = 0.8): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // تصغير الحجم إذا كان أكبر من الحد الأقصى
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('فشل ضغط الصورة'));
            }
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
}

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
    // ضغط الصورة أولاً لتسريع الرفع
    const compressedBlob = await compressImage(file);
    
    // استيراد Firebase ديناميكياً
    const { ref, uploadBytesResumable, getDownloadURL } = await import('firebase/storage');
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
    const fileName = `${timestamp}_${randomString}.jpg`;
    
    // إنشاء المرجع في Storage
    const storageRef = ref(storage, `${folder}/${fileName}`);
    
    // رفع الملف المضغوط
    const uploadTask = uploadBytesResumable(storageRef, compressedBlob, {
      contentType: 'image/jpeg',
    });
    
    // انتظار اكتمال الرفع
    await new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        null,
        (error) => reject(error),
        () => resolve(undefined)
      );
    });
    
    // الحصول على رابط التحميل
    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
    
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
    // تحويل Base64 إلى Blob
    const response = await fetch(base64Data);
    const originalBlob = await response.blob();
    
    // ضغط الصورة
    const file = new File([originalBlob], 'image.jpg', { type: 'image/jpeg' });
    const compressedBlob = await compressImage(file);
    
    // استيراد Firebase ديناميكياً
    const { ref, uploadBytesResumable, getDownloadURL } = await import('firebase/storage');
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
    const fileName = `${timestamp}_${randomString}.jpg`;
    
    // إنشاء المرجع في Storage
    const storageRef = ref(storage, `${folder}/${fileName}`);
    
    // رفع الملف المضغوط
    const uploadTask = uploadBytesResumable(storageRef, compressedBlob, {
      contentType: 'image/jpeg',
    });
    
    // انتظار اكتمال الرفع
    await new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        null,
        (error) => reject(error),
        () => resolve(undefined)
      );
    });
    
    // الحصول على رابط التحميل
    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error('خطأ في رفع الصورة Base64:', error);
    throw new Error('فشل رفع الصورة');
  }
}
