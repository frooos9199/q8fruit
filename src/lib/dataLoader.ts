import { loadAllDataFromFirebase } from './firebaseSync';

export const loadProductsData = async () => {
  try {
    console.log('🔄 جاري تحميل المنتجات...');

    console.log('📱 جاري التحميل من Firebase...');
    await loadAllDataFromFirebase();

    const updated = typeof window !== 'undefined' ? window.localStorage.getItem('products') : null;
    if (updated) {
      try {
        const parsed = JSON.parse(updated);
        if (Array.isArray(parsed)) {
          console.log(`✅ تم جلب ${parsed.length} منتج من Firebase`);
          return parsed;
        }
      } catch (e) {
        console.error('❌ خطأ في قراءة Firebase:', e);
      }
    }

    const fallback = typeof window !== 'undefined' ? window.localStorage.getItem('products') : null;
    if (fallback) {
      try {
        const parsed = JSON.parse(fallback);
        if (Array.isArray(parsed)) {
          console.warn(`⚠️ استخدام نسخة الكاش المحلية للمنتجات: ${parsed.length}`);
          return parsed;
        }
      } catch (e) {
        console.error('❌ خطأ في قراءة نسخة الكاش:', e);
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

    await loadAllDataFromFirebase();
    
    const updated = typeof window !== 'undefined' ? window.localStorage.getItem('cateringCategories') : null;
    if (updated) {
      try {
        const parsed = JSON.parse(updated);
        if (Array.isArray(parsed)) {
          console.log(`✅ تم جلب ${parsed.length} تصنيف من Firebase`);
          return parsed;
        }
      } catch (e) {
        console.error('❌ خطأ في قراءة التصنيفات من Firebase:', e);
      }
    }

    const fallback = typeof window !== 'undefined' ? window.localStorage.getItem('cateringCategories') : null;
    if (fallback) {
      try {
        const parsed = JSON.parse(fallback);
        if (Array.isArray(parsed)) {
          console.warn(`⚠️ استخدام نسخة الكاش المحلية للتصنيفات: ${parsed.length}`);
          return parsed;
        }
      } catch (e) {
        console.error('❌ خطأ في قراءة كاش التصنيفات:', e);
      }
    }

    return [];
  } catch (error) {
    console.error('❌ خطأ في تحميل التصنيفات:', error);
    return [];
  }
};
