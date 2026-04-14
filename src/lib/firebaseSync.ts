import { db } from './firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  onSnapshot, 
  updateDoc,
  deleteDoc,
  query
} from 'firebase/firestore';

type SyncAllDataOptions = {
  banners?: boolean;
  logo?: boolean;
  users?: boolean;
  orders?: boolean;
  delivery?: boolean;
  whatsappNumbers?: boolean;
  products?: boolean;
  catering?: boolean;
};

type GetProductsOptions = {
  includeInactive?: boolean;
  includeHidden?: boolean;
};

export const clearProductsCache = () => {
  if (typeof window === 'undefined') return;

  window.localStorage.removeItem('products');
  window.localStorage.removeItem('productsLastUpdate');
};

// مزامنة المنتجات مع Firebase (تحديث آمن)
export const syncProductsToFirebase = async (products: any[]) => {
  if (!db) {
    console.error('❌ Firebase db غير متاح');
    return false;
  }

  if (!products || products.length === 0) {
    console.warn('⚠️ لا توجد منتجات للمزامنة!');
    return false;
  }

  try {
    console.log('🔄 بدء مزامنة المنتجات مع Firebase:', products.length);
    const productsRef = collection(db!, 'products');
    
    // ✅ تحديث/إضافة المنتجات فقط (بدون حذف شامل)
    const updatePromises = products.map(async (product) => {
      const resolvedDocId = String(product.docId || product.id);
      const productData = {
        id: product.id ?? resolvedDocId,
        name: product.name || '',
        units: Array.isArray(product.units) ? product.units : [],
        category: product.category || '',
        categories: Array.isArray(product.categories) ? product.categories : [product.category || ''],
        active: product.active !== false,
        images: Array.isArray(product.images) ? product.images : [],
        image: product.image || '',
        hasOffer: product.hasOffer || false,
        discount: product.discount || 0,
        order: product.order || 0,
        quantity: product.quantity || 0,
        updatedAt: new Date().toISOString()
      };
      
      return setDoc(doc(productsRef, resolvedDocId), productData);
    });
    
    await Promise.all(updatePromises);
    console.log(`✅ تم مزامنة ${products.length} منتج`);
    return true;
  } catch (error) {
    console.error('❌ خطأ في مزامنة المنتجات:', error);
    return false;
  }
};

// جلب المنتجات من Firebase (فقط عند الحاجة للاستعادة)
export const getProductsFromFirebase = async (options: GetProductsOptions = {}) => {
  try {
    const { includeInactive = false, includeHidden = false } = options;
    console.log('🔍 جلب المنتجات من Firebase...');
    const productsRef = collection(db!, 'products');
    
    // جلب بدون orderBy لتجنب مشاكل الـ index
    const snapshot = await getDocs(productsRef);
    
    console.log(`📦 عدد المنتجات المسترجعة: ${snapshot.docs.length}`);
    
    const products = snapshot.docs.map(doc => {
      const data = doc.data();
      const resolvedId = (typeof data.id === 'number' || typeof data.id === 'string')
        ? data.id
        : doc.id;
      return {
        ...data,
        id: resolvedId,
        // التأكد من وجود الحقول الأساسية
        name: data.name || '',
        units: Array.isArray(data.units) ? data.units : [],
        category: data.category || '',
        categories: Array.isArray(data.categories) ? data.categories : [data.category || ''],
        active: data.active !== false,
        images: Array.isArray(data.images) ? data.images : (data.image ? [data.image] : []),
        hasOffer: data.hasOffer || false,
        discount: data.discount || 0,
        quantity: data.quantity || 0
      };
    }).filter((product) => {
      if (!includeInactive && product.active === false) {
        return false;
      }

      if (!includeHidden && (product as { isHidden?: boolean }).isHidden === true) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      const aNum = Number(a.id);
      const bNum = Number(b.id);
      const aIsNum = Number.isFinite(aNum);
      const bIsNum = Number.isFinite(bNum);
      if (aIsNum && bIsNum) return aNum - bNum;
      if (aIsNum) return -1;
      if (bIsNum) return 1;
      return String(a.id).localeCompare(String(b.id));
    }); // ترتيب يدوي بعد الجلب
    
    console.log('✅ تم جلب المنتجات بنجاح:', products.length);
    return products;
  } catch (error) {
    console.error('❌ خطأ في جلب المنتجات:', error);
    return [];
  }
};

// إزالة مراقب التغييرات التلقائية - الموقع هو المصدر
// export const watchProducts = (callback: (products: any[]) => void) => { ... }

// مزامنة التصنيفات مع Firebase
export const syncCategoriesToFirebase = async (categories: any[]) => {
  try {
    await setDoc(doc(db!, 'settings', 'categories'), {
      categories,
      updatedAt: new Date().toISOString()
    });
    
    console.log('تم مزامنة التصنيفات مع Firebase');
    return true;
  } catch (error) {
    console.error('خطأ في مزامنة التصنيفات:', error);
    return false;
  }
};

// مزامنة فئات الكيترنج مع Firebase (كمجموعة منفصلة)
export const syncCateringToFirebase = async (cateringCategories: any[]) => {
  try {
    // حذف جميع الفئات القديمة
    const cateringRef = collection(db!, 'cateringCategories');
    const existingDocs = await getDocs(cateringRef);
    const deletePromises = existingDocs.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    
    // إضافة الفئات الجديدة
    const addPromises = cateringCategories.map(category => 
      setDoc(doc(db!, 'cateringCategories', category.id.toString()), {
        ...category,
        updatedAt: new Date().toISOString()
      })
    );
    await Promise.all(addPromises);

    await setDoc(doc(db!, 'settings', 'categories'), {
      categories: cateringCategories.map((category) => ({
        id: category.id,
        name: category.name,
        image: category.image || null,
      })),
      updatedAt: new Date().toISOString()
    });
    
    console.log(`✅ تم مزامنة ${cateringCategories.length} فئة كيترنج مع Firebase`);
    return true;
  } catch (error) {
    console.error('❌ خطأ في مزامنة فئات الكيترنج:', error);
    return false;
  }
};

// جلب التصنيفات من Firebase
export const getCategoriesFromFirebase = async () => {
  try {
    const cateringRef = collection(db!, 'cateringCategories');
    const cateringSnapshot = await getDocs(cateringRef);

    if (!cateringSnapshot.empty) {
      return cateringSnapshot.docs
        .map((categoryDoc) => ({
          id: Number(categoryDoc.data().id ?? categoryDoc.id),
          ...categoryDoc.data(),
        }))
        .sort((a, b) => Number(a.id ?? 0) - Number(b.id ?? 0));
    }

    const docRef = doc(db!, 'settings', 'categories');
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data().categories || [];
    }
    return [];
  } catch (error) {
    console.error('خطأ في جلب التصنيفات:', error);
    return [];
  }
};

// مزامنة البانرات مع Firebase
export const syncBannersToFirebase = async (banners: string[]) => {
  try {
    await setDoc(doc(db!, 'settings', 'banners'), {
      banners,
      updatedAt: new Date().toISOString()
    });
    
    console.log('تم مزامنة البانرات مع Firebase');
    return true;
  } catch (error) {
    console.error('خطأ في مزامنة البانرات:', error);
    return false;
  }
};

// جلب البانرات من Firebase
export const getBannersFromFirebase = async () => {
  try {
    const docRef = doc(db!, 'settings', 'banners');
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data().banners || [];
    }
    return [];
  } catch (error) {
    console.error('خطأ في جلب البانرات:', error);
    return [];
  }
};

// مزامنة الشعار مع Firebase
export const syncLogoToFirebase = async (logo: string) => {
  try {
    await setDoc(doc(db!, 'settings', 'logo'), {
      logo,
      updatedAt: new Date().toISOString()
    });
    
    console.log('تم مزامنة الشعار مع Firebase');
    return true;
  } catch (error) {
    console.error('خطأ في مزامنة الشعار:', error);
    return false;
  }
};

export const syncWhatsAppNumbersToFirebase = async (numbers: string[]) => {
  try {
    await setDoc(doc(db!, 'settings', 'whatsappNumbers'), {
      numbers,
      updatedAt: new Date().toISOString()
    });

    console.log('تم مزامنة أرقام الواتساب مع Firebase');
    return true;
  } catch (error) {
    console.error('خطأ في مزامنة أرقام الواتساب:', error);
    return false;
  }
};

export const getWhatsAppNumbersFromFirebase = async () => {
  try {
    const docRef = doc(db!, 'settings', 'whatsappNumbers');
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data().numbers || [];
    }
    return [];
  } catch (error) {
    console.error('خطأ في جلب أرقام الواتساب:', error);
    return [];
  }
};

// جلب الشعار من Firebase
export const getLogoFromFirebase = async () => {
  try {
    const docRef = doc(db!, 'settings', 'logo');
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data().logo || null;
    }
    return null;
  } catch (error) {
    console.error('خطأ في جلب الشعار:', error);
    return null;
  }
};

export const syncApiKeysToFirebase = async (apiKeys: any[]) => {
  try {
    await setDoc(doc(db!, 'settings', 'apiKeys'), {
      fields: apiKeys,
      updatedAt: new Date().toISOString()
    });

    console.log('تم مزامنة مفاتيح الربط مع Firebase');
    return true;
  } catch (error) {
    console.error('خطأ في مزامنة مفاتيح الربط:', error);
    return false;
  }
};

export const getApiKeysFromFirebase = async () => {
  try {
    const docRef = doc(db!, 'settings', 'apiKeys');
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data().fields || [];
    }
    return [];
  } catch (error) {
    console.error('خطأ في جلب مفاتيح الربط:', error);
    return [];
  }
};

// مزامنة المستخدمين مع Firebase
export const syncUsersToFirebase = async (users: any[]) => {
  try {
    const usersRef = collection(db!, 'users');
    
    for (const user of users) {
      await setDoc(doc(usersRef, user.id.toString()), {
        ...user,
        updatedAt: new Date().toISOString()
      });
    }
    
    console.log('تم مزامنة المستخدمين مع Firebase');
    return true;
  } catch (error) {
    console.error('خطأ في مزامنة المستخدمين:', error);
    return false;
  }
};

// جلب المستخدمين من Firebase
export const getUsersFromFirebase = async () => {
  try {
    const usersRef = collection(db!, 'users');
    const snapshot = await getDocs(usersRef);
    
    const users = snapshot.docs.map(doc => ({
      ...doc.data(),
      id: parseInt(doc.id)
    })).sort((a, b) => a.id - b.id);
    
    return users;
  } catch (error) {
    console.error('خطأ في جلب المستخدمين:', error);
    return [];
  }
};

// مزامنة الطلبات مع Firebase
export const syncOrdersToFirebase = async (orders: any[]) => {
  try {
    const ordersRef = collection(db!, 'orders');
    
    for (const order of orders) {
      await setDoc(doc(ordersRef, order.id.toString()), {
        ...order,
        updatedAt: new Date().toISOString()
      });
    }
    
    console.log('تم مزامنة الطلبات مع Firebase');
    return true;
  } catch (error) {
    console.error('خطأ في مزامنة الطلبات:', error);
    return false;
  }
};

// جلب الطلبات من Firebase
export const getOrdersFromFirebase = async () => {
  try {
    const ordersRef = collection(db!, 'orders');
    const snapshot = await getDocs(ordersRef);
    
    const orders = snapshot.docs.map(doc => ({
      ...doc.data(),
      id: parseInt(doc.id)
    })).sort((a, b) => a.id - b.id);
    
    return orders;
  } catch (error) {
    console.error('خطأ في جلب الطلبات:', error);
    return [];
  }
};

// مزامنة إعدادات التوصيل مع Firebase
export const syncDeliverySettingsToFirebase = async (settings: any) => {
  try {
    await setDoc(doc(db!, 'settings', 'delivery'), {
      ...settings,
      updatedAt: new Date().toISOString()
    });
    
    console.log('تم مزامنة إعدادات التوصيل مع Firebase');
    return true;
  } catch (error) {
    console.error('خطأ في مزامنة إعدادات التوصيل:', error);
    return false;
  }
};

// جلب إعدادات التوصيل من Firebase
export const getDeliverySettingsFromFirebase = async () => {
  try {
    const docRef = doc(db!, 'settings', 'delivery');
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  } catch (error) {
    console.error('خطأ في جلب إعدادات التوصيل:', error);
    return null;
  }
};

// مزامنة شاملة لجميع البيانات
export const syncAllDataToFirebase = async (options: SyncAllDataOptions = {}) => {
  if (typeof window === 'undefined') return;

  const syncOptions: Required<SyncAllDataOptions> = {
    banners: options.banners ?? true,
    logo: options.logo ?? true,
    users: options.users ?? false,
    orders: options.orders ?? false,
    delivery: options.delivery ?? true,
    whatsappNumbers: options.whatsappNumbers ?? true,
    products: options.products ?? false,
    catering: options.catering ?? false,
  };
  
  try {
    if (syncOptions.products) {
      const products = localStorage.getItem('products');
      if (products) {
        const parsedProducts = JSON.parse(products);
        if (Array.isArray(parsedProducts) && parsedProducts.length > 0) {
          await syncProductsToFirebase(parsedProducts);
        } else {
          console.warn('لا توجد منتجات في localStorage');
        }
      }
    }

    if (syncOptions.catering) {
      const cateringCategories = localStorage.getItem('cateringCategories');
      if (cateringCategories) {
        const parsedCateringCategories = JSON.parse(cateringCategories);
        if (Array.isArray(parsedCateringCategories) && parsedCateringCategories.length > 0) {
          await syncCateringToFirebase(parsedCateringCategories);
          console.log(`✅ تم مزامنة ${parsedCateringCategories.length} فئة كيترنج`);
        }
      }
    }

    if (syncOptions.banners) {
      const banners = localStorage.getItem('banners');
      if (banners) {
        const parsedBanners = JSON.parse(banners);
        await syncBannersToFirebase(parsedBanners);
      }
    }

    if (syncOptions.logo) {
      const logo = localStorage.getItem('siteLogo');
      if (logo) {
        await syncLogoToFirebase(logo);
      }
    }

    if (syncOptions.users) {
      const users = localStorage.getItem('users');
      if (users) {
        const parsedUsers = JSON.parse(users);
        await syncUsersToFirebase(parsedUsers);
      }
    }

    if (syncOptions.orders) {
      const orders = localStorage.getItem('orders');
      if (orders) {
        const parsedOrders = JSON.parse(orders);
        await syncOrdersToFirebase(parsedOrders);
      }
    }

    if (syncOptions.delivery) {
      const deliveryPrice = localStorage.getItem('deliveryPrice');
      const deliveryTime = localStorage.getItem('deliveryTime');
      if (deliveryPrice || deliveryTime) {
        await syncDeliverySettingsToFirebase({
          deliveryPrice: deliveryPrice ? Number(deliveryPrice) : 2.5,
          deliveryTime: deliveryTime || 'خلال ساعتين'
        });
      }
    }

    if (syncOptions.whatsappNumbers) {
      const whatsappNumbers = localStorage.getItem('whatsappNumbers');
      if (whatsappNumbers) {
        const parsedNumbers = JSON.parse(whatsappNumbers);
        if (Array.isArray(parsedNumbers)) {
          await syncWhatsAppNumbersToFirebase(parsedNumbers);
        }
      }
    }
    
    console.log('تم مزامنة جميع البيانات مع Firebase');
    return true;
  } catch (error) {
    console.error('خطأ في المزامنة الشاملة:', error);
    return false;
  }
};

// جلب البيانات من Firebase للموبايل
export const loadAllDataFromFirebase = async () => {
  if (typeof window === 'undefined') return false;
  
  try {
    console.log('📱 جلب البيانات من Firebase...');
    
    // جلب المنتجات
    const products = await getProductsFromFirebase();
    console.log(`📦 تم جلب ${products.length} منتج من Firebase`);
    
    // المنتجات أصبحت Firebase-only، لذلك نحذف أي كاش قديم محلياً لتجنب الخلط مع بيانات localhost.
    clearProductsCache();
    
    // جلب التصنيفات
    const categories = await getCategoriesFromFirebase();
    if (categories.length > 0) {
      localStorage.setItem('cateringCategories', JSON.stringify(categories));
      console.log('✅ تم حفظ التصنيفات في localStorage');
    }
    
    // جلب البانرات
    const banners = await getBannersFromFirebase();
    if (banners.length > 0) {
      localStorage.setItem('banners', JSON.stringify(banners));
      console.log('✅ تم حفظ البانرات في localStorage');
    }
    
    // جلب الشعار
    const logo = await getLogoFromFirebase();
    if (logo) {
      localStorage.setItem('siteLogo', logo);
      console.log('✅ تم حفظ الشعار في localStorage');
    }

    const whatsappNumbers = await getWhatsAppNumbersFromFirebase();
    if (whatsappNumbers.length > 0) {
      localStorage.setItem('whatsappNumbers', JSON.stringify(whatsappNumbers));
      console.log('✅ تم حفظ أرقام الواتساب في localStorage');
    }
    
    console.log('✅ اكتمل جلب البيانات من Firebase');
    return true; // نجاح دائماً - حتى لو لم تكن هناك منتجات جديدة
  } catch (error) {
    console.error('❌ خطأ في جلب البيانات من Firebase:', error);
    return false;
  }
};

// جلب يدوي فقط للطوارئ (من لوحة الإدارة)
export const emergencyLoadFromFirebase = async () => {
  if (typeof window === 'undefined') return false;
  
  try {
    console.log('🆘 جلب طوارئ من Firebase...');
    
    await getProductsFromFirebase();
    clearProductsCache();
    
    const categories = await getCategoriesFromFirebase();
    if (categories.length > 0) {
      localStorage.setItem('cateringCategories', JSON.stringify(categories));
    }
    
    const users = await getUsersFromFirebase();
    if (users.length > 0) {
      localStorage.setItem('users', JSON.stringify(users));
    }
    
    const orders = await getOrdersFromFirebase();
    if (orders.length > 0) {
      localStorage.setItem('orders', JSON.stringify(orders));
    }
    
    console.log('✅ تم الجلب الطارئ من Firebase');
    return true;
  } catch (error) {
    console.error('❌ خطأ في الجلب الطارئ:', error);
    return false;
  }
};