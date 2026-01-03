import { loadAllDataFromFirebase } from './firebaseSync';

export const loadProductsData = async () => {
  try {
    console.log('🔄 جاري تحميل المنتجات...');
    
    // جرب localStorage أولاً
    const stored = typeof window !== 'undefined' ? window.localStorage.getItem('products') : null;
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          console.log(`✅ تم جلب ${parsed.length} منتج من localStorage`);
          return parsed;
        }
      } catch (e) {
        console.error('❌ خطأ في قراءة localStorage:', e);
      }
    }

    // جرب Firebase
    console.log('📱 جاري التحميل من Firebase...');
    await loadAllDataFromFirebase();
    
    // أعد المحاولة من localStorage
    const updated = typeof window !== 'undefined' ? window.localStorage.getItem('products') : null;
    if (updated) {
      try {
        const parsed = JSON.parse(updated);
        if (Array.isArray(parsed) && parsed.length > 0) {
          console.log(`✅ تم جلب ${parsed.length} منتج من Firebase`);
          return parsed;
        }
      } catch (e) {
        console.error('❌ خطأ في قراءة Firebase:', e);
      }
    }

    console.warn('⚠️ لا توجد منتجات متاحة');
    return [];
  } catch (error) {
    console.error('❌ خطأ في تحميل المنتجات:', error);
    return [];
  }
};

export const loadCategoriesData = async () => {
  try {
    console.log('🔄 جاري تحميل التصنيفات...');
    
    const stored = typeof window !== 'undefined' ? window.localStorage.getItem('cateringCategories') : null;
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          console.log(`✅ تم جلب ${parsed.length} تصنيف من localStorage`);
          return parsed;
        }
      } catch (e) {
        console.error('❌ خطأ في قراءة التصنيفات:', e);
      }
    }

    await loadAllDataFromFirebase();
    
    const updated = typeof window !== 'undefined' ? window.localStorage.getItem('cateringCategories') : null;
    if (updated) {
      try {
        const parsed = JSON.parse(updated);
        if (Array.isArray(parsed) && parsed.length > 0) {
          console.log(`✅ تم جلب ${parsed.length} تصنيف من Firebase`);
          return parsed;
        }
      } catch (e) {
        console.error('❌ خطأ في قراءة التصنيفات من Firebase:', e);
      }
    }

    return [];
  } catch (error) {
    console.error('❌ خطأ في تحميل التصنيفات:', error);
    return [];
  }
};
