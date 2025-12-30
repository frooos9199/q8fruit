// ضمان تزامن البيانات بين الديسكتوب والموبايل
export const syncData = () => {
  if (typeof window === 'undefined') return;

  // فرض تحديث البيانات من localStorage
  const forceRefresh = () => {
    // إعادة تحميل المنتجات
    const products = localStorage.getItem('products');
    if (products) {
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'products',
        newValue: products,
        oldValue: null,
        storageArea: localStorage
      }));
    }

    // إعادة تحميل التصنيفات
    const categories = localStorage.getItem('cateringCategories');
    if (categories) {
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'cateringCategories',
        newValue: categories,
        oldValue: null,
        storageArea: localStorage
      }));
    }

    // إعادة تحميل البانرات
    const banners = localStorage.getItem('banners');
    if (banners) {
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'banners',
        newValue: banners,
        oldValue: null,
        storageArea: localStorage
      }));
    }

    // إعادة تحميل الشعار
    const logo = localStorage.getItem('siteLogo');
    if (logo) {
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'siteLogo',
        newValue: logo,
        oldValue: null,
        storageArea: localStorage
      }));
    }
  };

  // تشغيل التحديث فوراً
  forceRefresh();

  // تشغيل التحديث كل 5 ثواني
  const interval = setInterval(forceRefresh, 5000);

  return () => clearInterval(interval);
};

// دالة لمسح الكاش
export const clearCache = () => {
  if (typeof window === 'undefined') return;
  
  // مسح كاش المتصفح
  if ('caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => {
        caches.delete(name);
      });
    });
  }

  // إعادة تحميل الصفحة
  window.location.reload();
};

// دالة للتحقق من التوافق
export const checkCompatibility = () => {
  if (typeof window === 'undefined') return true;

  const checks = {
    localStorage: typeof Storage !== 'undefined',
    fetch: typeof fetch !== 'undefined',
    promises: typeof Promise !== 'undefined',
    eventListener: typeof window.addEventListener !== 'undefined'
  };

  const isCompatible = Object.values(checks).every(check => check);
  
  if (!isCompatible) {
    console.warn('Browser compatibility issues detected:', checks);
  }

  return isCompatible;
};