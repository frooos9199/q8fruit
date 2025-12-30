// نظام إجباري لضمان تحميل جميع البيانات
export const forceLoadAllData = async () => {
  if (typeof window === 'undefined') return false;

  try {
    // مسح البيانات المحلية أولاً
    localStorage.removeItem('products');
    localStorage.removeItem('cateringCategories');
    localStorage.removeItem('banners');
    localStorage.removeItem('siteLogo');

    // انتظار قصير
    await new Promise(resolve => setTimeout(resolve, 500));

    // إعادة تحميل من Firebase
    const { loadAllDataFromFirebase } = await import('./firebaseSync');
    const success = await loadAllDataFromFirebase();

    if (success) {
      // إرسال إشعارات التحديث
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'products',
        newValue: localStorage.getItem('products'),
        storageArea: localStorage
      }));

      window.dispatchEvent(new StorageEvent('storage', {
        key: 'cateringCategories', 
        newValue: localStorage.getItem('cateringCategories'),
        storageArea: localStorage
      }));

      // إعادة تحميل الصفحة للتأكد
      setTimeout(() => {
        window.location.reload();
      }, 1000);

      return true;
    }

    return false;
  } catch (error) {
    console.error('خطأ في التحميل الإجباري:', error);
    return false;
  }
};

// دالة للتحقق من اكتمال البيانات
export const checkDataCompleteness = () => {
  if (typeof window === 'undefined') return false;

  const products = localStorage.getItem('products');
  const categories = localStorage.getItem('cateringCategories');

  try {
    const parsedProducts = products ? JSON.parse(products) : [];
    const parsedCategories = categories ? JSON.parse(categories) : [];

    // التحقق من وجود بيانات كافية
    const hasProducts = Array.isArray(parsedProducts) && parsedProducts.length > 0;
    const hasCategories = Array.isArray(parsedCategories) && parsedCategories.length > 0;

    return hasProducts && hasCategories;
  } catch {
    return false;
  }
};

// دالة لإعادة المحاولة
export const retryDataLoad = async (maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    console.log(`محاولة تحميل البيانات ${i + 1}/${maxRetries}`);
    
    const success = await forceLoadAllData();
    
    if (success && checkDataCompleteness()) {
      console.log('تم تحميل البيانات بنجاح');
      return true;
    }

    // انتظار قبل المحاولة التالية
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.error('فشل في تحميل البيانات بعد عدة محاولات');
  return false;
};