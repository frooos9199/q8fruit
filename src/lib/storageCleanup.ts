import { storage } from './firebase';
import { ref, deleteObject, listAll } from 'firebase/storage';

// حذف جميع الصور القديمة من Firebase Storage
export const cleanupOldImages = async () => {
  try {
    const imagesRef = ref(storage, 'products');
    const imagesList = await listAll(imagesRef);
    
    // حذف جميع الصور الموجودة
    const deletePromises = imagesList.items.map(imageRef => deleteObject(imageRef));
    await Promise.all(deletePromises);
    
    console.log('تم حذف جميع الصور القديمة من Firebase Storage');
    return true;
  } catch (error) {
    console.error('خطأ في حذف الصور القديمة:', error);
    return false;
  }
};

// حذف صورة محددة من Firebase Storage
export const deleteImageFromStorage = async (imagePath: string) => {
  try {
    const imageRef = ref(storage, imagePath);
    await deleteObject(imageRef);
    console.log(`تم حذف الصورة: ${imagePath}`);
    return true;
  } catch (error) {
    console.error('خطأ في حذف الصورة:', error);
    return false;
  }
};

// مزامنة الصور مع Firebase Storage (حذف القديمة ورفع الجديدة)
export const syncImagesWithFirebase = async (currentImages: string[]) => {
  try {
    // حذف جميع الصور القديمة أولاً
    await cleanupOldImages();
    
    // الصور الجديدة ستُرفع تلقائياً عند الحاجة من خلال ProductImageUploader
    console.log('تم تنظيف Firebase Storage وهو جاهز للصور الجديدة');
    return true;
  } catch (error) {
    console.error('خطأ في مزامنة الصور:', error);
    return false;
  }
};