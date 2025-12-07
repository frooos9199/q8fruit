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
    // استيراد Firebase Storage ديناميكياً
    const { storage } = await import('./firebase');
    const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
    
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
    // استيراد Firebase Storage ديناميكياً
    const { storage } = await import('./firebase');
    const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
    
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
