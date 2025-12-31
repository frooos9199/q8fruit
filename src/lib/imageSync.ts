import { storage } from './firebase';
import { ref, uploadBytes, getDownloadURL, listAll, deleteObject } from 'firebase/storage';

// رفع صورة إلى Firebase Storage
export const uploadImageToFirebase = async (file: File, path: string): Promise<string | null> => {
  try {
    const imageRef = ref(storage, `products/${path}`);
    const snapshot = await uploadBytes(imageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error('خطأ في رفع الصورة:', error);
    return null;
  }
};

// رفع صور متعددة
export const uploadMultipleImages = async (files: File[], productId: number): Promise<string[]> => {
  const uploadPromises = files.map((file, index) => 
    uploadImageToFirebase(file, `${productId}_${index}_${Date.now()}.${file.name.split('.').pop()}`)
  );
  
  const results = await Promise.all(uploadPromises);
  return results.filter(url => url !== null) as string[];
};

// جلب جميع صور المنتجات من Firebase Storage
export const getAllProductImages = async (): Promise<{ [productId: string]: string[] }> => {
  try {
    const productsRef = ref(storage, 'products/');
    const result = await listAll(productsRef);
    
    const imagesByProduct: { [productId: string]: string[] } = {};
    
    for (const itemRef of result.items) {
      const url = await getDownloadURL(itemRef);
      const fileName = itemRef.name;
      const productId = fileName.split('_')[0];
      
      if (!imagesByProduct[productId]) {
        imagesByProduct[productId] = [];
      }
      imagesByProduct[productId].push(url);
    }
    
    return imagesByProduct;
  } catch (error) {
    console.error('خطأ في جلب الصور:', error);
    return {};
  }
};

// مزامنة صور المنتجات مع البيانات المحلية (معطلة)
export const syncProductImages = async () => {
  console.log('🚫 تم تعطيل مزامنة الصور - الموقع هو المصدر');
  return true;
};

// حذف صور منتج من Firebase Storage
export const deleteProductImages = async (productId: number) => {
  try {
    const productsRef = ref(storage, 'products/');
    const result = await listAll(productsRef);
    
    const deletePromises = result.items
      .filter(itemRef => itemRef.name.startsWith(`${productId}_`))
      .map(itemRef => deleteObject(itemRef));
    
    await Promise.all(deletePromises);
    console.log(`تم حذف صور المنتج ${productId}`);
    return true;
  } catch (error) {
    console.error('خطأ في حذف الصور:', error);
    return false;
  }
};

// تحويل base64 إلى File
export const base64ToFile = (base64: string, fileName: string): File => {
  const arr = base64.split(',');
  const mime = arr[0].match(/:(.*?);/)![1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  
  return new File([u8arr], fileName, { type: mime });
};

// مزامنة شاملة للصور (معطلة)
export const fullImageSync = async () => {
  console.log('🚫 تم تعطيل المزامنة الشاملة للصور');
  return true;
};